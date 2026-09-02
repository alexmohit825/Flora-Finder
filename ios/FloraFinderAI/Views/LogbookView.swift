//
//  LogbookView.swift
//  FloraFinder AI
//
//  Created by A. Alex Mohit.
//  Copyright © 2026 A. Alex Mohit. All rights reserved.
//

import SwiftUI

public struct LogbookView: View {
    @EnvironmentObject private var store: ObservationStore
    @State private var searchText = ""
    @State private var selectedFilter: LogFilter = .all
    @State private var showingClearConfirmation = false
    
    enum LogFilter: String, CaseIterable, Identifiable {
        case all = "All Scans"
        case healthy = "Healthy"
        case diagnosed = "Pathology Rx"
        
        var id: String { rawValue }
    }
    
    var filteredObservations: [PlantObservation] {
        store.observations.filter { obs in
            let matchesSearch = searchText.isEmpty ||
                (obs.matches.first?.commonName.localizedCaseInsensitiveContains(searchText) ?? false) ||
                (obs.matches.first?.scientificName.localizedCaseInsensitiveContains(searchText) ?? false) ||
                (obs.matches.first?.family.localizedCaseInsensitiveContains(searchText) ?? false)
            
            switch selectedFilter {
            case .all:
                return matchesSearch
            case .healthy:
                let isHealthy = obs.diseaseDiagnosis == nil || obs.diseaseDiagnosis?.isDiseased == false
                return matchesSearch && isHealthy
            case .diagnosed:
                let isDiagnosed = obs.diseaseDiagnosis?.isDiseased == true
                return matchesSearch && isDiagnosed
            }
        }
    }
    
    public var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Filter Segmented Bar
                HStack(spacing: 8) {
                    ForEach(LogFilter.allCases) { filter in
                        Button {
                            selectedFilter = filter
                        } label: {
                            Text(filter.rawValue)
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(selectedFilter == filter ? .white : .gray)
                                .padding(.horizontal, 14)
                                .padding(.vertical, 8)
                                .background(selectedFilter == filter ? Color.purple : Color(white: 0.12))
                                .clipShape(Capsule())
                        }
                    }
                    Spacer()
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 10)
                
                if filteredObservations.isEmpty {
                    VStack(spacing: 16) {
                        Spacer()
                        Image(systemName: "book.closed")
                            .font(.system(size: 54))
                            .foregroundColor(.purple.opacity(0.6))
                        
                        Text(searchText.isEmpty ? "Your Botanical Journal is Empty" : "No Specimens Found")
                            .font(.headline)
                            .foregroundColor(.white)
                        
                        Text(searchText.isEmpty ? "All real specimens you scan will be securely cataloged here with their complete care profiles, pathology reports, and timestamps." : "Try adjusting your search query or filter category.")
                            .font(.caption)
                            .foregroundColor(.gray)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 32)
                        Spacer()
                    }
                } else {
                    List {
                        ForEach(filteredObservations) { obs in
                            NavigationLink {
                                ObservationDetailView(observation: obs)
                            } label: {
                                ObservationRow(observation: obs)
                            }
                            .listRowBackground(Color(white: 0.08))
                            .listRowInsets(EdgeInsets(top: 8, leading: 16, bottom: 8, trailing: 16))
                            .listRowSeparator(.hidden)
                        }
                        .onDelete { indexSet in
                            for index in indexSet {
                                let item = filteredObservations[index]
                                store.deleteObservation(id: item.id)
                            }
                        }
                    }
                    .listStyle(.plain)
                    .scrollContentBackground(.hidden)
                }
            }
            .background(Color(white: 0.04).ignoresSafeArea())
            .navigationTitle("Botanical Logbook")
            .searchable(text: $searchText, prompt: "Search by species, genus, or family...")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    if !store.observations.isEmpty {
                        Button(role: .destructive) {
                            showingClearConfirmation = true
                        } label: {
                            Image(systemName: "trash")
                                .foregroundColor(.red.opacity(0.8))
                        }
                    }
                }
            }
            .confirmationDialog("Clear All Observations?", isPresented: $showingClearConfirmation, titleVisibility: .visible) {
                Button("Clear All Observations", role: .destructive) {
                    store.clearAll()
                }
                Button("Cancel", role: .cancel) {}
            } message: {
                Text("This will permanently remove all scanned plant records from your device.")
            }
        }
    }
}

struct ObservationRow: View {
    let observation: PlantObservation
    
    var body: some View {
        HStack(spacing: 14) {
            if let uiImage = UIImage(data: observation.imageData) {
                Image(uiImage: uiImage)
                    .resizable()
                    .scaledToFill()
                    .frame(width: 64, height: 64)
                    .clipShape(RoundedRectangle(cornerRadius: 14))
            } else {
                RoundedRectangle(cornerRadius: 14)
                    .fill(Color.gray.opacity(0.3))
                    .frame(width: 64, height: 64)
            }
            
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(observation.matches.first?.commonName ?? "Botanical Specimen")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(.white)
                        .lineLimit(1)
                    Spacer()
                    if let diag = observation.diseaseDiagnosis, diag.isDiseased {
                        Text("Rx Needed")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundColor(.orange)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(Color.orange.opacity(0.15))
                            .clipShape(Capsule())
                    }
                }
                
                Text(observation.matches.first?.scientificName ?? "Species")
                    .font(.caption)
                    .italic()
                    .foregroundColor(.purple.opacity(0.85))
                    .lineLimit(1)
                
                HStack(spacing: 6) {
                    Image(systemName: "calendar")
                        .font(.system(size: 10))
                        .foregroundColor(.gray)
                    Text(formattedDate(observation.timestamp))
                        .font(.system(size: 11))
                        .foregroundColor(.gray)
                    
                    if let match = observation.matches.first {
                        Text("•")
                            .foregroundColor(.gray)
                        Text("\(Int(match.confidence * 100))% match")
                            .font(.system(size: 10, weight: .semibold, design: .monospaced))
                            .foregroundColor(.emerald)
                    }
                }
            }
        }
        .padding(12)
        .background(Color(white: 0.1))
        .cornerRadius(18)
    }
    
    private func formattedDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}
