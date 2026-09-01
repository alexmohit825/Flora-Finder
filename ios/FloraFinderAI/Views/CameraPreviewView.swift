//
//  CameraPreviewView.swift
//  FloraFinder AI
//
//  Created by A. Alex Mohit.
//  Copyright © 2026 A. Alex Mohit. All rights reserved.
//

import SwiftUI
import AVFoundation

public struct CameraPreviewView: UIViewRepresentable {
    public let session: AVCaptureSession
    
    public init(session: AVCaptureSession) {
        self.session = session
    }
    
    public func makeUIView(context: Context) -> VideoPreviewUIView {
        let view = VideoPreviewUIView()
        view.videoPreviewLayer.session = session
        view.videoPreviewLayer.videoGravity = .resizeAspectFill
        return view
    }
    
    public func updateUIView(_ uiView: VideoPreviewUIView, context: Context) {}
}

public class VideoPreviewUIView: UIView {
    public override class var layerClass: AnyClass {
        return AVCaptureVideoPreviewLayer.self
    }
    
    public var videoPreviewLayer: AVCaptureVideoPreviewLayer {
        return layer as! AVCaptureVideoPreviewLayer
    }
}
