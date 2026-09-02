//
//  CameraScannerView.swift
//  FloraFinder AI
//
//  Created by A. Alex Mohit.
//  Copyright © 2026 A. Alex Mohit. All rights reserved.
//

import SwiftUI
import PhotosUI

public struct CameraScannerView: View {
    public let initialMode: String
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var store: ObservationStore
    @ObservedObject private var subscriptionManager = SubscriptionManager.shared
    
    @StateObject private var camera = CameraService()
    @State private var scanMode: String
    @State private var selectedOrgan: OrganType = .auto
    @State private var selectedPhotoItem: PhotosPickerItem?
    
    @State private var isProcessing = false
    @State private var processingStatus = "Analyzing botanical morphology with Gemini 3.6 Flash..."
    @State private var completedObservation: PlantObservation?
    @State private var showingDetail = false
    @State private var showingSettings = false
    @State private var showingPaywall = false
    @State private var errorMessage: String?
    @State private var showingErrorAlert = false
    @State private var scanLineOffset: CGFloat = -140
    
    public init(initialMode: String = "identify") {
        self.initialMode = initialMode
        _scanMode = State(initialValue: initialMode)
    }
    
    public var body: some View {
        NavigationStack {
            ZStack {
                Color.black.ignoresSafeArea()
                
                if camera.cameraPermissionGranted {
                    CameraPreviewView(session: camera.session)
                        .ignoresSafeArea()
                } else {
                    VStack(spacing: 16) {
                        Image(systemName: "camera.badge.ellipsis")
                            .font(.system(size: 48))
                            .foregroundColor(.purple)
                        Text("Camera Permission Needed")
                            .font(.headline)
                            .foregroundColor(.white)
                        Text("FloraFinder uses the camera to recognize botanical specimens and diagnose plant health in real-time.")
                            .font(.caption)
                            .foregroundColor(.gray)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 32)
                    }
                }
                
                VStack {
                    Spacer()
                    ZStack {
                        RoundedRectangle(cornerRadius: 28)
                            .stroke(
                                scanMode == "identify"
                                ? LinearGradient(colors: [.purple, .indigo], startPoint: .topLeading, endPoint: .bottomTrailing)
                                : LinearGradient(colors: [.emerald, .teal], startPoint: .topLeading, endPoint: .bottomTrailing),
                                lineWidth: 2.5
                            )
                            .frame(width: 280, height: 280)
                            .background(Color.black.opacity(0.04))
                        
                        CornerBrackets()
                            .frame(width: 280, height: 280)
                            .foregroundColor(scanMode == "identify" ? .purple : .emerald)
                        
                        if isProcessing {
                            Rectangle()
                                .fill(
                                    LinearGradient(
                                        colors: [Color.clear, (scanMode == "identify" ? Color.purple : Color.emerald).opacity(0.8), Color.clear],
                                        startPoint: .top,
                                        endPoint: .bottom
                                    )
                                )
                                .frame(width: 260, height: 4)
                                .offset(y: scanLineOffset)
                                .onAppear {
                                    withAnimation(.easeInOut(duration: 1.2).repeatForever(autoreverses: true)) {
                                        scanLineOffset = 140
                                    }
                                }
                        }
                    }
                    Spacer()
                }
                
                VStack {
                    HStack {
                        Button {
                            dismiss()
                        } label: {
                            Image(systemName: "xmark")
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(.white)
                                .padding(12)
                                .background(.ultraThinMaterial)
                                .clipShape(Circle())
                        }
                        
                        Spacer()
                        
                        HStack(spacing: 4) {
                            Button {
                                scanMode = "identify"
                            } label: {
                                HStack(spacing: 4) {
                                    Image(systemName: "sparkles")
                                    Text("Flora ID")
                                }
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(scanMode == "identify" ? .white : .gray)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(scanMode == "identify" ? Color.purple : Color.clear)
                                .clipShape(Capsule())
                            }
                            
                            Button {
                                scanMode = "fix_plant"
                            } label: {
                                HStack(spacing: 4) {
                                    Image(systemName: "cross.case.fill")
                                    Text("Doctor Rx")
                                }
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(scanMode == "fix_plant" ? .white : .gray)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(scanMode == "fix_plant" ? Color.emerald : Color.clear)
                                .clipShape(Capsule())
                            }
                        }
                        .padding(4)
                        .background(.ultraThinMaterial)
                        .clipShape(Capsule())
                        
                        Spacer()
                        
                        Button {
                            camera.switchCamera()
                        } label: {
                            Image(systemName: "camera.rotate.fill")
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(.white)
                                .padding(12)
                                .background(.ultraThinMaterial)
                                .clipShape(Circle())
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 16)
                    
                    Spacer()
                }
                
                VStack {
                    Spacer()
                    
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(OrganType.allCases) { organ in
                                Button {
                                    selectedOrgan = organ
                                } label: {
                                    HStack(spacing: 4) {
                                        Image(systemName: organ.iconName)
                                        Text(organ.displayName)
                                    }
                                    .font(.system(size: 11, weight: .semibold))
                                    .foregroundColor(selectedOrgan == organ ? .white : .gray)
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 6)
                                    .background(selectedOrgan == organ ? Color.purple.opacity(0.8) : Color.black.opacity(0.6))
                                    .clipShape(Capsule())
                                    .overlay(
                                        Capsule()
                                            .stroke(selectedOrgan == organ ? Color.purple : Color.gray.opacity(0.3), lineWidth: 1)
                                    )
                                }
                            }
                        }
                        .padding(.horizontal, 20)
                    }
                    .padding(.bottom, 12)
                    
                    HStack(spacing: 40) {
                        PhotosPicker(selection: $selectedPhotoItem, matching: .images) {
                            Image(systemName: "photo.on.rectangle.angled")
                                .font(.system(size: 22))
                                .foregroundColor(.white)
                                .padding(16)
                                .background(.ultraThinMaterial)
                                .clipShape(Circle())
                        }
                        
                        Button {
                            Task {
                                await triggerCapture()
                            }
                        } label: {
                            ZStack {
                                Circle()
                                    .stroke(Color.white, lineWidth: 4)
                                    .frame(width: 76, height: 76)
                                Circle()
                                    .fill(scanMode == "identify" ? Color.purple : Color.emerald)
                                    .frame(width: 62, height: 62)
                                if isProcessing {
                                    ProgressView()
                                        .tint(.white)
                                }
                            }
                        }
                        .disabled(isProcessing)
                        
                        Circle()
                            .fill(Color.clear)
                            .frame(width: 54, height: 54)
                    }
                    .padding(.bottom, 36)
                }
                
                if isProcessing {
                    ZStack {
                        Color.black.opacity(0.7).ignoresSafeArea()
                        VStack(spacing: 16) {
                            ProgressView()
                                .scaleEffect(1.5)
                                .tint(.purple)
                            Text(processingStatus)
                                .font(.subheadline)
                                .fontWeight(.semibold)
                                .foregroundColor(.white)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal, 24)
                        }
                        .padding(24)
                        .background(.ultraThinMaterial)
                        .cornerRadius(24)
                    }
                }
            }
            .navigationDestination(isPresented: $showingDetail) {
                if let obs = completedObservation {
                    ObservationDetailView(observation: obs)
                }
            }
            .sheet(isPresented: $showingSettings) {
                SettingsView()
            }
            .sheet(isPresented: $showingPaywall) {
                PaywallView()
            }
            .alert("Notice", isPresented: $showingErrorAlert) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(errorMessage ?? "An error occurred during plant identification.")
            }
            .onChange(of: selectedPhotoItem) { _, newItem in
                guard let newItem = newItem else { return }
                if !subscriptionManager.isProUser && store.remainingFreeScans <= 0 {
                    showingPaywall = true
                    return
                }
                Task {
                    if let data = try? await newItem.loadTransferable(type: Data.self),
                       let image = UIImage(data: data) {
                        await processCapturedImage(image)
                    }
                }
            }
        }
    }
    
    private func triggerCapture() async {
        if !subscriptionManager.isProUser && store.remainingFreeScans <= 0 {
            showingPaywall = true
            return
        }
        
        UIImpactFeedbackGenerator(style: .medium).impactOccurred()
        do {
            let photo = try await camera.capturePhoto()
            await processCapturedImage(photo)
        } catch {
            print("Capture photo error: \(error)")
        }
    }
    
    private func processCapturedImage(_ image: UIImage) async {
        guard let jpegData = image.jpegData(compressionQuality: 0.85) else { return }
        
        isProcessing = true
        
        do {
            var matches: [PlantMatch] = []
            var diagnosis: PlantDiseaseDiagnosis? = nil
            var careProfile: PlantCareProfile? = nil
            var aiProvider = "Google Gemini 3.6 Flash"
            
            if scanMode == "identify" {
                processingStatus = "Analyzing species taxonomy with Gemini 3.6 Flash..."
                let result = try await GeminiBotanicalService.shared.identifyPlant(image: image, organ: selectedOrgan)
                matches = result.matches
                careProfile = result.care
                aiProvider = "Google Gemini 3.6 Flash"
            } else {
                processingStatus = "Analyzing plant health with Gemini Pathologist Engine..."
                diagnosis = try await GeminiBotanicalService.shared.diagnosePlant(image: image)
                aiProvider = "Google Gemini 3.6 Flash"
            }
            
            let observation = PlantObservation(
                imageData: jpegData,
                organ: selectedOrgan,
                scanMode: scanMode,
                matches: matches,
                diseaseDiagnosis: diagnosis,
                careProfile: careProfile,
                aiProvider: aiProvider
            )
            
            await MainActor.run {
                store.addObservation(observation)
                self.completedObservation = observation
                self.isProcessing = false
                self.showingDetail = true
            }
            
        } catch {
            print("Gemini processing error: \(error)")
            await MainActor.run {
                self.isProcessing = false
                self.errorMessage = error.localizedDescription
                self.showingErrorAlert = true
            }
        }
    }
}
