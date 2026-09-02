//
//  ObservationStore.swift
//  FloraFinder AI
//
//  Created by A. Alex Mohit.
//  Copyright © 2026 A. Alex Mohit. All rights reserved.
//

import Foundation
import SwiftUI
import Combine

@MainActor
public class ObservationStore: ObservableObject {
    @Published public var observations: [PlantObservation] = []
    @Published public var freeScansUsed: Int = 0
    
    public let maxFreeScans: Int = 3
    
    public var remainingFreeScans: Int {
        return max(0, maxFreeScans - freeScansUsed)
    }
    
    private let storageKey = "florafinder_native_observations_v1"
    private let scanCountKey = "florafinder_free_scans_count_v1"
    
    public init() {
        loadObservations()
        self.freeScansUsed = UserDefaults.standard.integer(forKey: scanCountKey)
    }
    
    public func loadObservations() {
        guard let data = UserDefaults.standard.data(forKey: storageKey) else {
            self.observations = []
            return
        }
        do {
            let decoded = try JSONDecoder().decode([PlantObservation].self, from: data)
            self.observations = decoded
        } catch {
            print("Failed to decode saved observations: \(error)")
            self.observations = []
        }
    }
    
    public func saveObservations() {
        do {
            let data = try JSONEncoder().encode(observations)
            UserDefaults.standard.set(data, forKey: storageKey)
        } catch {
            print("Failed to save observations: \(error)")
        }
    }
    
    public func addObservation(_ observation: PlantObservation) {
        observations.insert(observation, at: 0)
        saveObservations()
        
        if !SubscriptionManager.shared.isProUser {
            freeScansUsed += 1
            UserDefaults.standard.set(freeScansUsed, forKey: scanCountKey)
        }
    }
    
    public func deleteObservation(id: String) {
        observations.removeAll { $0.id == id }
        saveObservations()
    }
    
    public func clearAll() {
        observations.removeAll()
        saveObservations()
    }
}\n