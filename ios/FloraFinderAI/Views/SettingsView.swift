//
//  SettingsView.swift
//  FloraFinder AI
//
//  Created by A. Alex Mohit.
//  Copyright © 2026 A. Alex Mohit. All rights reserved.
//

import SwiftUI
import StoreKit

public struct SettingsView: View {
    @ObservedObject private var subscriptionManager = SubscriptionManager.shared
    @State private var showingPaywall = false
    @State private var showingRestoredAlert = false
    @State private var alertMessage = ""
    
    public var body: some View {
        NavigationStack {
            Form {
                // Subscription & Membership Section
                Section(header: Text("Membership").foregroundColor(.purple)) {
                    HStack {
                        Image(systemName: "crown.fill")
                            .foregroundColor(.yellow)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(subscriptionManager.isProUser ? "FloraFinder Pro Active" : "Free Membership")
                                .font(.subheadline)
                                .fontWeight(.semibold)
                            Text(subscriptionManager.isProUser ? "Unlimited AI species scans & pathology Rx" : "3 free scans included")
                                .font(.caption2)
                                .foregroundColor(.gray)
                        }
                        Spacer()
                        if subscriptionManager.isProUser {
                            Image(systemName: "checkmark.seal.fill")
                                .foregroundColor(.yellow)
                        }
                    }
                    
                    if !subscriptionManager.isProUser {
                        Button {
                            showingPaywall = true
                        } label: {
                            HStack {
                                Spacer()
                                Text("Upgrade to FloraFinder Pro")
                                    .fontWeight(.bold)
                                    .foregroundColor(.yellow)
                                Spacer()
                            }
                        }
                    }
                    
                    Button {
                        Task {
                            await subscriptionManager.restorePurchases()
                            if subscriptionManager.isProUser {
                                alertMessage = "Your FloraFinder Pro subscription has been restored!"
                                showingRestoredAlert = true
                            } else {
                                alertMessage = "No prior active subscriptions found."
                                showingRestoredAlert = true
                            }
                        }
                    } label: {
                        Text("Restore Purchases")
                            .foregroundColor(.white)
                    }
                }
                
                // AI Intelligence Engine
                Section(header: Text("AI Recognition Engine").foregroundColor(.purple)) {
                    HStack {
                        Image(systemName: "sparkles")
                            .foregroundColor(.purple)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Primary Engine")
                                .font(.subheadline)
                                .fontWeight(.semibold)
                            Text("Google Gemini 3.6 Flash (Pre-Configured Cloud)")
                                .font(.caption2)
                                .foregroundColor(.gray)
                        }
                        Spacer()
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.emerald)
                    }
                }
                
                // Legal & About
                Section(header: Text("Legal & App Info").foregroundColor(.purple)) {
                    Link("Privacy Policy", destination: URL(string: "https://github.com/alexmohit825/Flora-Finder/blob/main/PRIVACY_POLICY.md")!)
                    Link("Terms of Use (EULA)", destination: URL(string: "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/")!)
                    
                    HStack {
                        Text("Version")
                        Spacer()
                        Text("1.0.0")
                            .foregroundColor(.gray)
                    }
                    HStack {
                        Text("Developer")
                        Spacer()
                        Text("2026 A. Alex Mohit")
                            .foregroundColor(.gray)
                    }
                }
            }
            .scrollContentBackground(.hidden)
            .background(Color(white: 0.05).ignoresSafeArea())
            .navigationTitle("Settings")
            .sheet(isPresented: $showingPaywall) {
                PaywallView()
            }
            .alert("Purchases", isPresented: $showingRestoredAlert) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(alertMessage)
            }
        }
    }
}
