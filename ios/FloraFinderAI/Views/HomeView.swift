//
//  HomeView.swift
//  FloraFinder AI
//
//  Created by A. Alex Mohit.
//  Copyright © 2026 A. Alex Mohit. All rights reserved.
//

import SwiftUI

public struct HomeView: View {
    @EnvironmentObject private var store: ObservationStore
    @ObservedObject private var subscriptionManager = SubscriptionManager.shared
    @State private var activeScanMode: String?
    @State private var showingScanner = false
    @State private var showingPaywall = false
    @State private var selectedObservation: PlantObservation?
    
    public var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Header Bar
                    HStack {
                        HStack(spacing: 12) {
                            ZStack {
                                RoundedRectangle(cornerRadius: 14)
                                    .fill(LinearGradient(colors: [.purple, .indigo], startPoint: .topLeading, endPoint: .bottomTrailing))
                                    .frame(width: 44, height: 44)
                                Image(systemName: "camera.macro")
                                    .font(.system(size: 22))
                                    .foregroundColor(.white)
                            }
                            
                            VStack(alignment: .leading, spacing: 2) {
                                HStack(spacing: 6) {
                                    Text("FloraFinder AI")
                                        .font(.title3)
                                        .fontWeight(.bold)
                                        .foregroundColor(.white)
                                    
                                    if subscriptionManager.isProUser {
                                        Text("PRO")
                                            .font(.system(size: 10, weight: .bold))
                                            .foregroundColor(.black)
                                            .padding(.horizontal, 6)
                                            .padding(.vertical, 2)
                                            .background(Color.yellow)
                                            .clipShape(Capsule())
                                    }
                                }
                                
                                Text("Botanical Taxonomy & Pathology")
                                    .font(.caption2)
                                    .foregroundColor(.purple.opacity(0.8))
                            }
                        }
                        
                        Spacer()
                        
                        HStack(spacing: 8) {
                            if !subscriptionManager.isProUser {
                                Button {
                                    showingPaywall = true
                                } label: {
                                    HStack(spacing: 3) {
                                        Image(systemName: "crown.fill")
                                            .foregroundColor(.yellow)
                                        Text("Upgrade")
                                            .foregroundColor(.white)
                                    }
                                    .font(.system(size: 11, weight: .bold))
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 6)
                                    .background(Color.yellow.opacity(0.15))
                                    .clipShape(Capsule())
                                    .overlay(
                                        Capsule()
                                            .stroke(Color.yellow.opacity(0.4), lineWidth: 1)
                                    )
                                }
                            }
                            
                            HStack(spacing: 4) {
                                Image(systemName: "leaf.fill")
                                Text("\(store.observations.count)")
                            }
                            .font(.system(size: 12, weight: .bold, design: .monospaced))
                            .foregroundColor(.purple)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(Color.purple.opacity(0.15))
                            .clipShape(Capsule())
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 12)
                    
                    // Freemium Scan Quota Banner (for Free Users)
                    if !subscriptionManager.isProUser {
                        HStack(spacing: 14) {
                            ZStack {
                                Circle()
                                    .fill(Color.purple.opacity(0.2))
                                    .frame(width: 40, height: 40)
                                Image(systemName: "sparkles")
                                    .font(.system(size: 18))
                                    .foregroundColor(.purple)
                            }
                            
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Free AI Scans: \(store.remainingFreeScans) of \(store.maxFreeScans) remaining")
                                    .font(.system(size: 13, weight: .bold))
                                    .foregroundColor(.white)
                                Text("Upgrade to Pro for unlimited Gemini 3.6 scans & Pathology Rx")
                                    .font(.system(size: 11))
                                    .foregroundColor(.gray)
                            }
                            
                            Spacer()
                            
                            Button("Get Pro") {
                                showingPaywall = true
                            }
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(.black)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(Color.yellow)
                            .clipShape(Capsule())
                        }
                        .padding(12)
                        .background(Color(white: 0.08))
                        .cornerRadius(16)
                        .overlay(
                            RoundedRectangle(cornerRadius: 16)
                                .stroke(Color.purple.opacity(0.3), lineWidth: 1)
                        )
                        .padding(.horizontal, 20)
                    }
                    
                    // Action Buttons (Identify & Fix My Plant)
                    HStack(spacing: 14) {
                        Button {
                            startScan(mode: "identify")
                        } label: {
                            VStack(alignment: .leading, spacing: 12) {
                                ZStack {
                                    Circle()
                                        .fill(LinearGradient(colors: [.purple, .indigo], startPoint: .topLeading, endPoint: .bottomTrailing))
                                        .frame(width: 44, height: 44)
                                    Image(systemName: "sparkles")
                                        .font(.system(size: 18))
                                        .foregroundColor(.white)
                                }
                                
                                VStack(alignment: .leading, spacing: 2) {
                                    Text("Identify Species")
                                        .font(.subheadline)
                                        .fontWeight(.bold)
                                        .foregroundColor(.white)
                                    Text("Gemini 3.6 Precision")
                                        .font(.caption2)
                                        .foregroundColor(.gray)
                                }
                            }
                            .padding(16)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Color(white: 0.1))
                            .cornerRadius(20)
                            .overlay(
                                RoundedRectangle(cornerRadius: 20)
                                    .stroke(Color.purple.opacity(0.3), lineWidth: 1)
                            )
                        }
                        
                        Button {
                            startScan(mode: "fix_plant")
                        } label: {
                            VStack(alignment: .leading, spacing: 12) {
                                ZStack {
                                    Circle()
                                        .fill(LinearGradient(colors: [.emerald, .teal], startPoint: .topLeading, endPoint: .bottomTrailing))
                                        .frame(width: 44, height: 44)
                                    Image(systemName: "cross.case.fill")
                                        .font(.system(size: 18))
                                        .foregroundColor(.white)
                                }
                                
                                VStack(alignment: .leading, spacing: 2) {
                                    Text("Fix My Plant")
                                        .font(.subheadline)
                                        .fontWeight(.bold)
                                        .foregroundColor(.white)
                                    Text("Disease & Care Rx")
                                        .font(.caption2)
                                        .foregroundColor(.gray)
                                }
                            }
                            .padding(16)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Color(white: 0.1))
                            .cornerRadius(20)
                            .overlay(
                                RoundedRectangle(cornerRadius: 20)
                                    .stroke(Color.emerald.opacity(0.3), lineWidth: 1)
                            )
                        }
                    }
                    .padding(.horizontal, 20)
                    
                    // Recent Observations Section
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Text("Recent Observations")
                                .font(.footnote)
                                .fontWeight(.bold)
                                .foregroundColor(.gray)
                                .textCase(.uppercase)
                            Spacer()
                            if !store.observations.isEmpty {
                                Button("Clear All") {
                                    store.clearAll()
                                }
                                .font(.caption)
                                .foregroundColor(.red.opacity(0.8))
                            }
                        }
                        .padding(.horizontal, 20)
                        
                        if store.observations.isEmpty {
                            VStack(spacing: 12) {
                                Image(systemName: "leaf.circle")
                                    .font(.system(size: 48))
                                    .foregroundColor(.purple.opacity(0.6))
                                Text("No Scanned Plants Yet")
                                    .font(.subheadline)
                                    .fontWeight(.bold)
                                    .foregroundColor(.white)
                                Text("Point your camera at any live plant or flower to identify exact species, diagnose health, and receive care instructions.")
                                    .font(.caption)
                                    .foregroundColor(.gray)
                                    .multilineTextAlignment(.center)
                                    .padding(.horizontal, 24)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 44)
                            .background(Color(white: 0.08))
                            .cornerRadius(24)
                            .padding(.horizontal, 20)
                        } else {
                            LazyVStack(spacing: 10) {
                                ForEach(store.observations.prefix(5)) { obs in
                                    NavigationLink {
                                        ObservationDetailView(observation: obs)
                                    } label: {
                                        HStack(spacing: 14) {
                                            if let uiImage = UIImage(data: obs.imageData) {
                                                Image(uiImage: uiImage)
                                                    .resizable()
                                                    .scaledToFill()
                                                    .frame(width: 54, height: 54)
                                                    .clipShape(RoundedRectangle(cornerRadius: 12))
                                            }
                                            
                                            VStack(alignment: .leading, spacing: 3) {
                                                Text(obs.matches.first?.commonName ?? "Specimen")
                                                    .font(.subheadline)
                                                    .fontWeight(.semibold)
                                                    .foregroundColor(.white)
                                                Text(obs.matches.first?.scientificName ?? "Species")
                                                    .font(.caption2)
                                                    .italic()
                                                    .foregroundColor(.gray)
                                                
                                                HStack(spacing: 6) {
                                                    Text(obs.aiProvider)
                                                        .font(.system(size: 9, weight: .bold))
                                                        .foregroundColor(.purple)
                                                }
                                            }
                                            
                                            Spacer()
                                            
                                            Image(systemName: "chevron.right")
                                                .font(.system(size: 12, weight: .semibold))
                                                .foregroundColor(.gray.opacity(0.5))
                                        }
                                        .padding(12)
                                        .background(Color(white: 0.1))
                                        .cornerRadius(16)
                                    }
                                }
                            }
                            .padding(.horizontal, 20)
                        }
                    }
                }
                .padding(.bottom, 32)
            }
            .background(Color(white: 0.04).ignoresSafeArea())
            .fullScreenCover(isPresented: $showingScanner) {
                CameraScannerView(initialMode: activeScanMode ?? "identify")
            }
            .sheet(isPresented: $showingPaywall) {
                PaywallView()
            }
        }
    }
    
    private func startScan(mode: String) {
        if !subscriptionManager.isProUser && store.remainingFreeScans <= 0 {
            showingPaywall = true
        } else {
            activeScanMode = mode
            showingScanner = true
        }
    }
}\n