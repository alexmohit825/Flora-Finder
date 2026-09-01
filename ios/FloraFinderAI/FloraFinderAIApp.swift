//
//  FloraFinderAIApp.swift
//  FloraFinder AI
//
//  Created by A. Alex Mohit.
//  Copyright © 2026 A. Alex Mohit. All rights reserved.
//

import SwiftUI

@main
struct FloraFinderAIApp: App {
    @StateObject private var store = ObservationStore()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(store)
                .preferredColorScheme(.dark)
        }
    }
}
