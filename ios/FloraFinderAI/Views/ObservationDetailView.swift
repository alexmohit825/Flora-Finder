//
//  ObservationDetailView.swift
//  FloraFinder AI
//
//  Created by A. Alex Mohit.
//  Copyright © 2026 A. Alex Mohit. All rights reserved.
//

import SwiftUI

public struct ObservationDetailView: View {
    public let observation: PlantObservation
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var store: ObservationStore
    
    public var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                ZStack(alignment: .bottomLeading) {
                    if let uiImage = UIImage(data: observation.imageData) {
                        Image(uiImage: uiImage)
                            .resizable()
                            .scaledToFill()
                            .frame(height: 280)
                            .clipped()
                    } else {
                        Rectangle()
                            .fill(Color.gray.opacity(0.3))
                            .frame(height: 280)
                    }
                    
                    LinearGradient(
                        colors: [Color.clear, Color.black.opacity(0.85)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                    
                    VStack(alignment: .leading, spacing: 4) {
                        HStack(spacing: 6) {
                            Image(systemName: "sparkles")
                            Text(observation.aiProvider)
                        }
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.purple)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 4)
                        .background(Color.black.opacity(0.6))
                        .clipShape(Capsule())
                        
                        let topMatch = observation.matches.first
                        Text(topMatch?.commonName ?? "Botanical Specimen")
                            .font(.title2)
                            .fontWeight(.bold)
                            .foregroundColor(.white)
                        
                        Text(topMatch?.scientificName ?? "Species")
                            .font(.subheadline)
                            .italic()
                            .foregroundColor(.purple.opacity(0.8))
                    }
                    .padding(20)
                }
                .frame(height: 280)
                
                VStack(spacing: 20) {
                    if !observation.matches.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Taxonomic Matches")
                                .font(.footnote)
                                .fontWeight(.bold)
                                .foregroundColor(.gray)
                                .textCase(.uppercase)
                            
                            ForEach(observation.matches, id: \.id) { match in
                                HStack {
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(match.commonName)
                                            .font(.subheadline)
                                            .fontWeight(.semibold)
                                            .foregroundColor(.white)
                                        Text(match.scientificName)
                                            .font(.caption)
                                            .italic()
                                            .foregroundColor(.gray)
                                    }
                                    
                                    Spacer()
                                    
                                    Text("\(Int(match.confidence * 100))%")
                                        .font(.system(size: 12, weight: .bold, design: .monospaced))
                                        .foregroundColor(match.confidence > 0.8 ? .emerald : .purple)
                                        .padding(.horizontal, 8)
                                        .padding(.vertical, 4)
                                        .background((match.confidence > 0.8 ? Color.emerald : Color.purple).opacity(0.15))
                                        .clipShape(Capsule())
                                }
                                .padding(12)
                                .background(Color(white: 0.1))
                                .cornerRadius(14)
                            }
                        }
                    }
                    
                    if let diag = observation.diseaseDiagnosis {
                        DiagnosisResultView(diagnosis: diag)
                    }
                    
                    if let care = observation.careProfile {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Horticultural Care Guide")
                                .font(.footnote)
                                .fontWeight(.bold)
                                .foregroundColor(.gray)
                                .textCase(.uppercase)
                            
                            VStack(spacing: 12) {
                                CareRow(icon: "sun.max.fill", title: "Sunlight", description: care.care.sun, color: .orange)
                                CareRow(icon: "drop.fill", title: "Watering", description: care.care.water, color: .blue)
                                CareRow(icon: "leaf.fill", title: "Soil Mix", description: care.care.soil, color: .emerald)
                                CareRow(icon: "pawprint.fill", title: "Pet Toxicity", description: care.toxicity.pets, color: .purple)
                            }
                        }
                    }
                    
                    Button(role: .destructive) {
                        store.deleteObservation(id: observation.id)
                        dismiss()
                    } label: {
                        HStack {
                            Image(systemName: "trash")
                            Text("Delete Observation")
                        }
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundColor(.red)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(Color.red.opacity(0.12))
                        .cornerRadius(16)
                    }
                    .padding(.top, 10)
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 32)
            }
        }
        .background(Color(white: 0.05).ignoresSafeArea())
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct CareRow: View {
    let icon: String
    let title: String
    let description: String
    let color: Color
    
    var body: some View {
        HStack(alignment: .top, spacing: 14) {
            Image(systemName: icon)
                .font(.system(size: 16))
                .foregroundColor(color)
                .frame(width: 32, height: 32)
                .background(color.opacity(0.15))
                .clipShape(Circle())
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                Text(description)
                    .font(.caption)
                    .foregroundColor(.gray)
                    .lineSpacing(2)
            }
            Spacer()
        }
        .padding(14)
        .background(Color(white: 0.1))
        .cornerRadius(16)
    }
}
