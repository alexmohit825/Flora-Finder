//
//  CameraService.swift
//  FloraFinder AI
//
//  Created by A. Alex Mohit.
//  Copyright © 2026 A. Alex Mohit. All rights reserved.
//

import Foundation
import AVFoundation
import UIKit
import Combine

public final class CameraService: NSObject, ObservableObject {
    @Published public var isRunning = false
    @Published public var currentPosition: AVCaptureDevice.Position = .back
    @Published public var flashMode: AVCaptureDevice.FlashMode = .auto
    @Published public var capturedImage: UIImage?
    @Published public var cameraPermissionGranted = false
    
    public let session = AVCaptureSession()
    private let photoOutput = AVCapturePhotoOutput()
    private var videoDeviceInput: AVCaptureDeviceInput?
    private let sessionQueue = DispatchQueue(label: "com.AlexMohit.FloraFinder.cameraSessionQueue")
    
    private var photoContinuation: CheckedContinuation<UIImage, Error>?
    
    public override init() {
        super.init()
        checkPermissions()
    }
    
    public func checkPermissions() {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            self.cameraPermissionGranted = true
            setupSession()
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { granted in
                DispatchQueue.main.async {
                    self.cameraPermissionGranted = granted
                    if granted {
                        self.setupSession()
                    }
                }
            }
        default:
            self.cameraPermissionGranted = false
        }
    }
    
    public func setupSession() {
        sessionQueue.async {
            self.session.beginConfiguration()
            self.session.sessionPreset = .photo
            
            do {
                guard let camera = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: self.currentPosition) else {
                    self.session.commitConfiguration()
                    return
                }
                
                let input = try AVCaptureDeviceInput(device: camera)
                if self.session.canAddInput(input) {
                    self.session.addInput(input)
                    self.videoDeviceInput = input
                }
                
                if self.session.canAddOutput(self.photoOutput) {
                    self.session.addOutput(self.photoOutput)
                }
                
                self.session.commitConfiguration()
                self.startSession()
            } catch {
                self.session.commitConfiguration()
                print("Camera setup error: \(error)")
            }
        }
    }
    
    public func startSession() {
        sessionQueue.async {
            guard !self.session.isRunning else { return }
            self.session.startRunning()
            DispatchQueue.main.async {
                self.isRunning = self.session.isRunning
            }
        }
    }
    
    public func stopSession() {
        sessionQueue.async {
            guard self.session.isRunning else { return }
            self.session.stopRunning()
            DispatchQueue.main.async {
                self.isRunning = false
            }
        }
    }
    
    public func switchCamera() {
        sessionQueue.async {
            self.session.beginConfiguration()
            if let currentInput = self.videoDeviceInput {
                self.session.removeInput(currentInput)
            }
            
            let newPosition: AVCaptureDevice.Position = (self.currentPosition == .back) ? .front : .back
            guard let newCamera = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: newPosition),
                  let newInput = try? AVCaptureDeviceInput(device: newCamera) else {
                self.session.commitConfiguration()
                return
            }
            
            if self.session.canAddInput(newInput) {
                self.session.addInput(newInput)
                self.videoDeviceInput = newInput
                self.currentPosition = newPosition
            }
            
            self.session.commitConfiguration()
        }
    }
    
    public func capturePhoto() async throws -> UIImage {
        return try await withCheckedThrowingContinuation { continuation in
            sessionQueue.async {
                self.photoContinuation = continuation
                let settings = AVCapturePhotoSettings()
                if self.photoOutput.supportedFlashModes.contains(self.flashMode) {
                    settings.flashMode = self.flashMode
                }
                self.photoOutput.capturePhoto(with: settings, delegate: self)
            }
        }
    }
}

extension CameraService: AVCapturePhotoCaptureDelegate {
    public func photoOutput(_ output: AVCapturePhotoOutput, didFinishProcessingPhoto photo: AVCapturePhoto, error: Error?) {
        if let error = error {
            photoContinuation?.resume(throwing: error)
            photoContinuation = nil
            return
        }
        
        guard let data = photo.fileDataRepresentation(),
              let image = UIImage(data: data) else {
            let err = NSError(domain: "CameraService", code: -1, userInfo: [NSLocalizedDescriptionKey: "Failed to decode photo data"])
            photoContinuation?.resume(throwing: err)
            photoContinuation = nil
            return
        }
        
        DispatchQueue.main.async {
            self.capturedImage = image
        }
        
        photoContinuation?.resume(returning: image)
        photoContinuation = nil
    }
}
