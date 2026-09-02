//
//  SettingsView.swift
//  FloraFinder AI
//
//  Created by A. Alex Mohit.
//  Copyright © 2026 A. Alex Mohit. All rights reserved.
//

import SwiftUI

public struct SettingsView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var apiKeyInput: String = ""
    @State private var showingSavedAlert = false
    
    public var body: some View {
        NavigationStack {
            Form {
                Section(header: Text("AI Recognition Engine").foregroundColor(.purple)) {
                    HStack {
                        Image(systemName: "sparkles")
                            .foregroundColor(.purple)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Primary Engine")
                                .font(.subheadline)
                                .fontWeight(.semibold)
                            Text("Google Gemini 2.5 Flash (Species Precision)")
                                .font(.caption2)
                                .foregroundColor(.gray)
                        }
                        Spacer()
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.emerald)
                    }
                    
                    HStack {
                        Image(systemName: "apple.logo")
                            .foregroundColor(.white)
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Offline Fallback")
                                .font(.subheadline)
                                .fontWeight(.semibold)
                            Text("Apple Vision Neural Engine (On-Device)")
                                .font(.caption2)
                                .foregroundColor(.gray)
                        }
                    }
                }
                
                Section(header: Text("Gemini API Configuration").foregroundColor(.purple),
                        footer: Text("Gemini 2.5 Flash provides exact species, family, genus, and pet toxicity alerts at ~$0.0001 per scan. The free tier supports 1,500 scans/day for $0.00.").font(.caption2).foregroundColor(.gray)) {
                    SecureField("Enter Gemini API Key", text: $apiKeyInput)
                        .autocapitalization(.none)
                        .disableAutocorrection(true)
                    
                    Button {
                        GeminiBotanicalService.shared.apiKey = apiKeyInput
                        showingSavedAlert = true
                    } label: {
                        HStack {
                            Spacer()
                            Text("Save API Key")
                                .fontWeight(.bold)
                                .foregroundColor(.purple)
                            Spacer()
                        }
                    }
                }
                
                Section(header: Text("About").foregroundColor(.purple)) {
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
            .navigationTitle("AI Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                    .foregroundColor(.purple)
                    .fontWeight(.bold)
                }
            }
            .onAppear {
                self.apiKeyInput = GeminiBotanicalService.shared.apiKey
            }
            .alert("Settings Saved", isPresented: $showingSavedAlert) {
                Button("OK", role: .cancel) {}
            } message: {
                Text("Gemini API key has been updated successfully.")
            }
        }
    }
}
