# Image Annotation Feature

## Overview
The Question Inspector now includes a powerful image annotation feature that allows users to draw and annotate directly on question and answer images.

## Features

### 1. **Edit Mode Toggle**
- Switch between View Mode and Edit Mode using the button at the top of each section
- View Mode: Standard image viewing experience
- Edit Mode: Interactive canvas with drawing tools

### 2. **Drawing Tools**

#### Pen Tool
- Draw freehand annotations on images
- Available in 7 colors:
  - Black
  - Red
  - Blue
  - Green
  - Yellow
  - Purple
  - White
- Adjustable stroke width (2px - 20px)

#### Eraser Tool
- Remove annotations
- 3x larger than pen stroke for easier erasing

### 3. **Annotation Controls**
- **Size Adjustment**: Use + and - buttons to change stroke width
- **Clear**: Remove all annotations from current image
- **Save**: Store annotations in browser's localStorage for persistence
- **Export**: Download annotated image as PNG file

### 4. **Persistence**
Annotations are automatically saved per image and question ID combination, so they persist:
- When switching between questions
- When returning to the same question later
- Across browser sessions (stored in localStorage)

### 5. **Multi-Image Support**
- Each image in a question or answer set can be annotated independently
- Image counter shows progress (e.g., "Image 1 of 3")
- Export each image individually with its annotations

## Where to Find It

The annotation feature is available in three sections of the Question Inspector:

1. **Question View** - Annotate question images
2. **Answer View** - Annotate answer images
3. **Both View** - Annotate both question and answer images side-by-side

## Usage Tips

1. **Start Drawing**: Click "Edit Mode" button to enable the annotation canvas
2. **Choose Your Tool**: Select pen or eraser
3. **Customize**: Pick your color and adjust stroke width
4. **Annotate**: Draw directly on the image
5. **Save Work**: Click "Save" to store annotations locally
6. **Export**: Click "Export" to download the annotated image

## Technical Details

### Libraries Used
- **react-konva**: React wrapper for Konva.js canvas library
- **konva**: HTML5 Canvas JavaScript framework

### Storage
Annotations are stored in `localStorage` with the key format:
```
annotations-{questionId}-{imageIndex}
```

### Export Format
- Format: PNG
- Resolution: 2x pixel ratio for high quality
- Filename: `annotated-{questionId}-img{index}.png`

## Browser Compatibility
Works on all modern browsers that support:
- HTML5 Canvas
- localStorage
- Touch events (for mobile/tablet drawing)

## Mobile/Tablet Support
- Full touch support for drawing with finger or stylus
- Responsive controls that adapt to screen size
- Optimized for both portrait and landscape orientations

