//
//  SubscriptionManager.swift
//  FloraFinder AI
//
//  Created by A. Alex Mohit.
//  Copyright © 2026 A. Alex Mohit. All rights reserved.
//

import Foundation
import StoreKit
import SwiftUI
import Combine

public enum ProductTier: String, CaseIterable {
    case monthly = "com.AlexMohit.FloraFinderAI.pro.monthly"
    case yearly = "com.AlexMohit.FloraFinderAI.pro.yearly"
    case lifetime = "com.AlexMohit.FloraFinderAI.pro.lifetime"
}

@MainActor
public class SubscriptionManager: ObservableObject {
    public static let shared = SubscriptionManager()
    
    @Published public var products: [Product] = []
    @Published public var purchasedProductIDs: Set<String> = []
    @Published public var isProUser: Bool = false
    @Published public var isLoading: Bool = false
    @Published public var errorMessage: String?
    
    private var updatesTask: Task<Void, Never>?
    
    public init() {
        updatesTask = listenForTransactions()
        Task {
            await requestProducts()
            await updatePurchasedProducts()
        }
    }
    
    deinit {
        updatesTask?.cancel()
    }
    
    public func requestProducts() async {
        isLoading = true
        do {
            let productIDs = ProductTier.allCases.map { $0.rawValue }
            let storeProducts = try await Product.products(for: productIDs)
            self.products = storeProducts.sorted { $0.price < $1.price }
            self.isLoading = false
        } catch {
            print("Failed to load StoreKit products: \(error)")
            self.errorMessage = "Unable to fetch App Store products: \(error.localizedDescription)"
            self.isLoading = false
        }
    }
    
    public func purchase(_ product: Product) async throws -> Bool {
        isLoading = true
        defer { isLoading = false }
        
        let result = try await product.purchase()
        
        switch result {
        case .success(let verification):
            let transaction = try checkVerified(verification)
            await updatePurchasedProducts()
            await transaction.finish()
            return true
        case .userCancelled:
            return false
        case .pending:
            return false
        @unknown default:
            return false
        }
    }
    
    public func restorePurchases() async {
        isLoading = true
        defer { isLoading = false }
        
        try? await AppStore.sync()
        await updatePurchasedProducts()
    }
    
    public func updatePurchasedProducts() async {
        var activeIDs: Set<String> = []
        
        for await result in Transaction.currentEntitlements {
            do {
                let transaction = try checkVerified(result)
                if transaction.revocationDate == nil {
                    activeIDs.insert(transaction.productID)
                }
            } catch {
                print("Failed entitlement verification: \(error)")
            }
        }
        
        self.purchasedProductIDs = activeIDs
        self.isProUser = !activeIDs.isEmpty
    }
    
    private func listenForTransactions() -> Task<Void, Never> {
        return Task.detached {
            for await result in Transaction.updates {
                do {
                    let transaction = try self.checkVerified(result)
                    await self.updatePurchasedProducts()
                    await transaction.finish()
                } catch {
                    print("Transaction update verification error: \(error)")
                }
            }
        }
    }
    
    nonisolated private func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .unverified(_, let error):
            throw error
        case .verified(let safe):
            return safe
        }
    }
}
