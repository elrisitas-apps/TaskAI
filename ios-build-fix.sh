#!/bin/bash
# Quick fix script for iOS build issues

echo "Cleaning build artifacts..."
cd ios
rm -rf Pods Podfile.lock build
rm -rf ~/Library/Developer/Xcode/DerivedData/TaskAI-*

echo "Reinstalling pods..."
pod install

echo "Done! Try building in Xcode now:"
echo "open ios/TaskAI.xcworkspace"
