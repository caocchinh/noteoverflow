"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Stage,
  Layer,
  Line,
  Image as KonvaImage,
  Text,
  Transformer,
} from "react-konva";
import { Button } from "@/components/ui/button";
import {
  Download,
  Eraser,
  Minus,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Undo,
  Redo,
  Highlighter,
  Type,
  ZoomIn,
  ZoomOut,
  Maximize,
  MousePointer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Konva from "konva";
import { toast } from "sonner";

interface Line {
  tool: string;
  points: number[];
  color: string;
  strokeWidth: number;
}

interface Textbox {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
  width: number;
  height: number;
}

interface ImageData {
  src: string;
  image: HTMLImageElement | null;
  x: number;
  y: number;
  width: number;
  height: number;
  error: string | null;
  loading: boolean;
}

interface ImageAnnotatorProps {
  imageUrls: string[];
  currentQuestionId?: string;
  isEditMode: boolean;
}

const COLORS = [
  { name: "Black", value: "#000000" },
  { name: "Red", value: "#EF4444" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Green", value: "#10B981" },
  { name: "Yellow", value: "#F59E0B" },
  { name: "Purple", value: "#A855F7" },
  { name: "White", value: "#FFFFFF" },
];

export const ImageAnnotator = ({
  imageUrls,
  currentQuestionId,
  isEditMode,
}: ImageAnnotatorProps) => {
  const [images, setImages] = useState<ImageData[]>(
    imageUrls.map((src) => ({
      src,
      image: null,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      error: null,
      loading: true,
    }))
  );
  const [tool, setTool] = useState<
    "pen" | "eraser" | "highlight" | "textbox" | "select"
  >("pen");
  const [lines, setLines] = useState<Line[]>([]);
  const [textboxes, setTextboxes] = useState<Textbox[]>([]);
  const [penColor, setPenColor] = useState("#EF4444");
  const [highlightColor, setHighlightColor] = useState("#F59E0B");
  const [textboxColor, setTextboxColor] = useState("#000000");
  const [penSize, setPenSize] = useState(4);
  const [eraserSize, setEraserSize] = useState(12);
  const [highlightSize, setHighlightSize] = useState(20);
  const [textboxFontSize, setTextboxFontSize] = useState(16);
  const [selectedTextboxId, setSelectedTextboxId] = useState<string | null>(
    null
  );
  const [editingTextboxId, setEditingTextboxId] = useState<string | null>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 0,
    height: 0,
  });

  // Zoom and pan state
  const [scale, setScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPosition, setDragStartPosition] = useState({ x: 0, y: 0 });
  const [stagePositionAtDragStart, setStagePositionAtDragStart] = useState({
    x: 0,
    y: 0,
  });

  // History for undo/redo functionality
  const [history, setHistory] = useState<Line[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const isDrawing = useRef(false);
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const textEditInputRef = useRef<HTMLInputElement>(null);

  // Calculate dimensions to fit container and stack images vertically
  const calculateDimensions = useCallback(
    (loadedImages: ImageData[]) => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth - 32; // Padding
      const maxHeight = window.innerHeight * 0.8;
      let totalHeight = 0;
      let maxWidth = 0;

      // Calculate dimensions for each image and accumulate total height
      const updatedImages = loadedImages.map((imgData) => {
        if (!imgData.image) return imgData;

        const scale = Math.min(
          containerWidth / imgData.image.width,
          maxHeight / imgData.image.height,
          1 // Don't scale up beyond original size
        );

        const scaledWidth = imgData.image.width * scale;
        const scaledHeight = imgData.image.height * scale;

        return {
          ...imgData,
          width: scaledWidth,
          height: scaledHeight,
          y: totalHeight, // Stack vertically
          x: 0, // Center horizontally if needed, but for now start at 0
        };
      });

      // Find max width and total height
      updatedImages.forEach((img) => {
        maxWidth = Math.max(maxWidth, img.width);
        totalHeight += img.height;
      });

      // Center images horizontally within the max width
      const centeredImages = updatedImages.map((img) => ({
        ...img,
        x: (maxWidth - img.width) / 2,
      }));

      setCanvasDimensions({ width: maxWidth, height: totalHeight });
      setImages(centeredImages);
    },
    [containerRef]
  );

  // Save current lines state to history
  const saveToHistory = useCallback(
    (newLines: Line[]) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push([...newLines]);
        return newHistory;
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex]
  );

  // Undo function
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setLines([...history[historyIndex - 1]]);
    }
  }, [historyIndex, history]);

  // Redo function
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      setLines([...history[historyIndex + 1]]);
    }
  }, [historyIndex, history]);

  // Zoom functions
  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev * 1.2, 5)); // Max zoom 5x
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev / 1.2, 0.1)); // Min zoom 0.1x
  }, []);

  const handleZoomReset = useCallback(() => {
    setScale(1);
    setStagePosition({ x: 0, y: 0 });
  }, []);

  const handleZoomToFit = useCallback(() => {
    if (
      !containerRef.current ||
      canvasDimensions.width === 0 ||
      canvasDimensions.height === 0
    )
      return;

    const containerWidth = containerRef.current.offsetWidth - 32;
    const containerHeight = window.innerHeight * 0.8;

    const scaleX = containerWidth / canvasDimensions.width;
    const scaleY = containerHeight / canvasDimensions.height;
    const newScale = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%

    setScale(newScale);
    setStagePosition({ x: 0, y: 0 });
  }, [canvasDimensions]);

  // Wheel zoom handler
  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();

      const stage = stageRef.current;
      if (!stage) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const zoomFactor = e.evt.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.min(Math.max(scale * zoomFactor, 0.1), 5);

      // Calculate new position to zoom towards cursor
      const mousePointTo = {
        x: (pointer.x - stagePosition.x) / scale,
        y: (pointer.y - stagePosition.y) / scale,
      };

      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };

      setScale(newScale);
      setStagePosition(newPos);
    },
    [scale, stagePosition]
  );

  // Load all images
  useEffect(() => {
    const loadImages = async () => {
      const promises = imageUrls.map(async (src) => {
        return new Promise<ImageData>((resolve) => {
          const timeoutId = setTimeout(() => {
            resolve({
              src,
              image: null,
              x: 0,
              y: 0,
              width: 0,
              height: 0,
              error:
                "Image loading timed out. Please check your internet connection.",
              loading: false,
            });
          }, 10000);

          const loadImage = (useCORS: boolean = true) => {
            const img = new window.Image();
            if (useCORS) {
              img.crossOrigin = "anonymous";
            }
            img.src = src;

            img.onload = () => {
              clearTimeout(timeoutId);
              resolve({
                src,
                image: img,
                x: 0,
                y: 0,
                width: img.width,
                height: img.height,
                error: useCORS
                  ? null
                  : "CORS error: Drawing annotations are disabled. Server doesn't allow cross-origin requests.",
                loading: false,
              });
            };

            img.onerror = () => {
              if (useCORS) {
                loadImage(false);
              } else {
                clearTimeout(timeoutId);
                resolve({
                  src,
                  image: null,
                  x: 0,
                  y: 0,
                  width: 0,
                  height: 0,
                  error: "Failed to load image from server.",
                  loading: false,
                });
              }
            };
          };

          loadImage(true);
        });
      });

      const loadedImages = await Promise.all(promises);
      setImages(loadedImages);
      calculateDimensions(loadedImages);
    };

    loadImages();
  }, [imageUrls, calculateDimensions]);

  // Recalculate on resize
  useEffect(() => {
    const handleResize = () => {
      if (images.some((img) => img.image) && containerRef.current) {
        calculateDimensions(images);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [images, calculateDimensions]);

  // Clear annotations when switching questions
  useEffect(() => {
    setLines([]);
    setTextboxes([]);
    setHistory([[]]);
    setHistoryIndex(0);
    setSelectedTextboxId(null);
    setEditingTextboxId(null);
  }, [currentQuestionId]);

  // Debug lines state changes
  useEffect(() => {
    console.log("Lines state changed:", lines);
  }, [lines]);

  // Update transformer when selected textbox changes
  useEffect(() => {
    if (transformerRef.current && stageRef.current) {
      if (selectedTextboxId) {
        const selectedNode = stageRef.current.findOne(`#${selectedTextboxId}`);
        if (selectedNode) {
          transformerRef.current.nodes([selectedNode]);
          transformerRef.current.getLayer()?.batchDraw();
        }
      } else {
        transformerRef.current.nodes([]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    }
  }, [selectedTextboxId]);

  // Handle direct text editing on canvas
  useEffect(() => {
    if (editingTextboxId && stageRef.current && containerRef.current) {
      const textbox = textboxes.find((tb) => tb.id === editingTextboxId);
      if (!textbox) return;

      // Get the stage container position
      const stageContainer = stageRef.current.container();
      const containerRect = stageContainer.getBoundingClientRect();

      // Calculate the position of the textbox on screen
      const textboxX = textbox.x * scale + stagePosition.x + containerRect.left;
      const textboxY = textbox.y * scale + stagePosition.y + containerRect.top;

      // Create or update the input element
      let inputElement = textEditInputRef.current;
      if (!inputElement) {
        inputElement = document.createElement("input");
        inputElement.type = "text";
        inputElement.style.position = "absolute";
        inputElement.style.zIndex = "9999";
        inputElement.style.border = "2px solid #3B82F6";
        inputElement.style.borderRadius = "4px";
        inputElement.style.padding = "4px";
        inputElement.style.fontSize = `${textbox.fontSize * scale}px`;
        inputElement.style.fontFamily = "Arial, sans-serif";
        inputElement.style.color = textbox.color;
        inputElement.style.backgroundColor = "white";
        inputElement.style.outline = "none";
        inputElement.style.minWidth = "100px";
        inputElement.style.pointerEvents = "auto";
        textEditInputRef.current = inputElement;
        document.body.appendChild(inputElement);
      }

      // Position and style the input
      inputElement.style.left = `${textboxX}px`;
      inputElement.style.top = `${textboxY}px`;
      inputElement.style.width = `${Math.max(textbox.width * scale, 100)}px`;
      inputElement.style.height = `${textbox.height * scale}px`;
      inputElement.value = textbox.text;

      // Use setTimeout to ensure DOM is updated before focusing
      setTimeout(() => {
        inputElement?.focus();
        inputElement?.select();
      }, 0);

      // Handle input changes
      const handleInputChange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        setTextboxes((prev) =>
          prev.map((tb) =>
            tb.id === editingTextboxId ? { ...tb, text: target.value } : tb
          )
        );
      };

      // Handle finishing edit
      const handleFinishEdit = () => {
        setEditingTextboxId(null);
        if (inputElement && inputElement.parentNode) {
          inputElement.parentNode.removeChild(inputElement);
          textEditInputRef.current = null;
        }
      };

      // Handle key events
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleFinishEdit();
        } else if (e.key === "Escape") {
          e.preventDefault();
          // Revert changes
          setTextboxes((prev) =>
            prev.map((tb) =>
              tb.id === editingTextboxId ? { ...tb, text: textbox.text } : tb
            )
          );
          handleFinishEdit();
        }
      };

      // Handle blur (clicking outside)
      const handleBlur = () => {
        handleFinishEdit();
      };

      // Remove existing listeners first to avoid duplicates
      inputElement.removeEventListener("input", handleInputChange);
      inputElement.removeEventListener("keydown", handleKeyDown);
      inputElement.removeEventListener("blur", handleBlur);

      inputElement.addEventListener("input", handleInputChange);
      inputElement.addEventListener("keydown", handleKeyDown);
      inputElement.addEventListener("blur", handleBlur);

      // Cleanup function
      return () => {
        if (inputElement) {
          inputElement.removeEventListener("input", handleInputChange);
          inputElement.removeEventListener("keydown", handleKeyDown);
          inputElement.removeEventListener("blur", handleBlur);
        }
      };
    } else {
      // Clean up input element when not editing
      if (textEditInputRef.current && textEditInputRef.current.parentNode) {
        textEditInputRef.current.parentNode.removeChild(
          textEditInputRef.current
        );
        textEditInputRef.current = null;
      }
    }
  }, [editingTextboxId, textboxes, scale, stagePosition]);

  const handleMouseDown = (
    e: Konva.KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    if (!isEditMode) return;

    const stagePos = e.target.getStage()?.getPointerPosition();
    console.log("Pointer position:", stagePos);
    if (!stagePos) return;

    // Convert stage coordinates to canvas coordinates
    const pos = {
      x: (stagePos.x - stagePosition.x) / scale,
      y: (stagePos.y - stagePosition.y) / scale,
    };

    // Handle clicking on existing textboxes - select them instead of creating new ones
    if (e.target.hasName("textbox")) {
      const textboxId = e.target.id();
      setSelectedTextboxId(textboxId);
      setEditingTextboxId(textboxId);
      return;
    }

    // Handle textbox creation - only when clicking on empty space and textbox tool is selected
    if (tool === "textbox") {
      const newTextbox: Textbox = {
        id: `textbox-${Date.now()}-${Math.random()}`,
        x: pos.x,
        y: pos.y,
        text: "Enter text...",
        fontSize: textboxFontSize,
        color: textboxColor,
        width: 200,
        height: textboxFontSize + 10,
      };
      setTextboxes((prev) => [...prev, newTextbox]);
      setSelectedTextboxId(newTextbox.id);
      return;
    }

    // Handle clicking outside textboxes to deselect and finish editing
    if (selectedTextboxId) {
      setSelectedTextboxId(null);
      setEditingTextboxId(null);
    }

    // Start dragging if space key is held or if not drawing
    const isSpacePressed = e.evt instanceof MouseEvent && e.evt.ctrlKey;
    if (isSpacePressed || tool === "select") {
      setIsDragging(true);
      setDragStartPosition(stagePos);
      setStagePositionAtDragStart(stagePosition);
      return;
    }

    isDrawing.current = true;

    if (tool !== "eraser") {
      const getLineProperties = () => {
        switch (tool) {
          case "pen":
            return { color: penColor, strokeWidth: penSize };
          case "highlight":
            return { color: highlightColor, strokeWidth: highlightSize };
          default:
            return { color: penColor, strokeWidth: penSize };
        }
      };

      const { color: lineColor, strokeWidth: lineWidth } = getLineProperties();

      const newLine = {
        tool,
        points: [pos.x, pos.y],
        color: lineColor,
        strokeWidth: lineWidth,
      };
      const newLines = [...lines, newLine];
      console.log("Adding new line:", newLine, "Total lines:", newLines.length);
      setLines(newLines);
    }
  };

  const handleMouseMove = (
    e: Konva.KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    console.log("Mouse move event fired", {
      isDrawing: isDrawing.current,
      isEditMode,
      hasErrors: images.some((img) => img.error),
      isDragging,
    });
    if (!isEditMode) return;

    const stage = e.target.getStage();
    const stagePoint = stage?.getPointerPosition();
    console.log("Move pointer position:", stagePoint);
    if (!stagePoint) return;

    // Convert stage coordinates to canvas coordinates
    const point = {
      x: (stagePoint.x - stagePosition.x) / scale,
      y: (stagePoint.y - stagePosition.y) / scale,
    };

    // Handle dragging
    if (isDragging) {
      const dx = stagePoint.x - dragStartPosition.x;
      const dy = stagePoint.y - dragStartPosition.y;
      setStagePosition({
        x: stagePositionAtDragStart.x + dx,
        y: stagePositionAtDragStart.y + dy,
      });
      return;
    }

    if (!isDrawing.current) return;

    if (tool === "eraser") {
      // Eraser logic: remove lines that intersect with the eraser
      setLines((prevLines) => {
        return prevLines.filter((line) => {
          // Check if any point in the line is within the eraser radius
          for (let i = 0; i < line.points.length; i += 2) {
            const lineX = line.points[i];
            const lineY = line.points[i + 1];
            const distance = Math.sqrt(
              Math.pow(point.x - lineX, 2) + Math.pow(point.y - lineY, 2)
            );
            // If any point is within eraser radius, remove the entire line
            if (distance <= eraserSize / 2) {
              return false;
            }
          }
          return true;
        });
      });

      // Eraser logic: remove textboxes that intersect with the eraser
      setTextboxes((prevTextboxes) => {
        return prevTextboxes.filter((textbox) => {
          // Check if the eraser circle intersects with the textbox rectangle
          const eraserRadius = eraserSize / 2;
          const textboxLeft = textbox.x;
          const textboxRight = textbox.x + textbox.width;
          const textboxTop = textbox.y;
          const textboxBottom = textbox.y + textbox.height;

          // Find the closest point on the textbox rectangle to the eraser center
          const closestX = Math.max(
            textboxLeft,
            Math.min(point.x, textboxRight)
          );
          const closestY = Math.max(
            textboxTop,
            Math.min(point.y, textboxBottom)
          );

          // Calculate distance from eraser center to closest point
          const distance = Math.sqrt(
            Math.pow(point.x - closestX, 2) + Math.pow(point.y - closestY, 2)
          );

          // If distance is less than or equal to eraser radius, remove the textbox
          return distance > eraserRadius;
        });
      });
    } else {
      // Drawing logic for pen and highlighter
      setLines((prevLines) => {
        const newLines = [...prevLines];
        if (newLines.length > 0) {
          const lastLine = newLines[newLines.length - 1];
          lastLine.points = lastLine.points.concat([point.x, point.y]);
        }
        return newLines;
      });
    }
  };

  const handleMouseUp = () => {
    console.log("Mouse up event fired");
    isDrawing.current = false;
    setIsDragging(false);
    // Save current state to history after drawing
    setLines((currentLines) => {
      saveToHistory(currentLines);
      return currentLines;
    });
  };

  const handleClear = () => {
    const clearedLines: Line[] = [];
    setLines(clearedLines);
    setTextboxes([]);
    saveToHistory(clearedLines);
    setSelectedTextboxId(null);
    setEditingTextboxId(null);
    toast.success("Annotations cleared", { duration: 2000 });
  };

  const handleExport = () => {
    if (!stageRef.current) return;

    const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
    const link = document.createElement("a");
    link.download = `annotated-${currentQuestionId || "question"}-combined.png`;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Combined image exported successfully!", { duration: 2000 });
  };

  const handleSaveAnnotation = () => {
    // Store annotations in localStorage for persistence
    const storageKey = `annotations-${currentQuestionId}-combined`;
    const annotations = {
      lines,
      textboxes,
    };
    localStorage.setItem(storageKey, JSON.stringify(annotations));
    toast.success("Annotations saved", { duration: 2000 });
  };

  // Load saved annotations
  useEffect(() => {
    const storageKey = `annotations-${currentQuestionId}-combined`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        // Handle both old format (just lines) and new format (lines + textboxes)
        if (Array.isArray(parsedData)) {
          // Old format - just lines
          const filteredLines = parsedData.filter(
            (line: Line) => line.tool !== "eraser"
          );
          setLines(filteredLines);
          setTextboxes([]);
        } else {
          // New format - lines and textboxes
          const filteredLines =
            parsedData.lines?.filter((line: Line) => line.tool !== "eraser") ||
            [];
          setLines(filteredLines);
          setTextboxes(parsedData.textboxes || []);
        }
        setHistory([
          Array.isArray(parsedData) ? parsedData : parsedData.lines || [],
        ]);
        setHistoryIndex(0);
        setSelectedTextboxId(null);
        setEditingTextboxId(null);
      } catch (e) {
        console.error("Failed to load annotations", e);
        setLines([]);
        setTextboxes([]);
        setHistory([[]]);
        setHistoryIndex(0);
        setSelectedTextboxId(null);
        setEditingTextboxId(null);
      }
    } else {
      setLines([]);
      setTextboxes([]);
      setHistory([[]]);
      setHistoryIndex(0);
      setSelectedTextboxId(null);
      setEditingTextboxId(null);
    }
  }, [currentQuestionId]);

  // Keyboard shortcuts for undo/redo and zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isEditMode) return;

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "z":
            if (!e.shiftKey) {
              e.preventDefault();
              handleUndo();
            } else {
              e.preventDefault();
              handleRedo();
            }
            break;
          case "y":
            e.preventDefault();
            handleRedo();
            break;
          case "=":
          case "+":
            e.preventDefault();
            handleZoomIn();
            break;
          case "-":
            e.preventDefault();
            handleZoomOut();
            break;
          case "0":
            e.preventDefault();
            handleZoomReset();
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isEditMode,
    handleUndo,
    handleRedo,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
  ]);

  const isLoading = images.some((img) => img.loading);

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <div className="animate-pulse text-muted-foreground">
          Loading images...
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full flex flex-col gap-3 relative">
      {isEditMode && (
        <div className="flex flex-wrap gap-2 items-center justify-between bg-accent/50 p-3 rounded-lg border border-border sticky top-0 z-10">
          <div className={cn("flex flex-wrap gap-2 items-center")}>
            {/* Tool Selection */}
            <div className="flex gap-1 p-1 bg-background rounded-md border border-border">
              <Button
                type="button"
                variant={tool === "select" ? "default" : "ghost"}
                className={cn(
                  "h-8 w-8 cursor-pointer",
                  tool === "select" && "bg-primary"
                )}
                onClick={() => setTool("select")}
                title="Select/Pan"
              >
                <MousePointer className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={tool === "pen" ? "default" : "ghost"}
                className={cn(
                  "h-8 w-8 cursor-pointer",
                  tool === "pen" && "bg-primary"
                )}
                onClick={() => setTool("pen")}
                title="Pen"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={tool === "eraser" ? "default" : "ghost"}
                className={cn(
                  "h-8 w-8 cursor-pointer",
                  tool === "eraser" && "bg-primary"
                )}
                onClick={() => setTool("eraser")}
                title="Eraser"
              >
                <Eraser className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={tool === "highlight" ? "default" : "ghost"}
                className={cn(
                  "h-8 w-8 cursor-pointer",
                  tool === "highlight" && "bg-primary"
                )}
                onClick={() => setTool("highlight")}
                title="Highlighter"
              >
                <Highlighter className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={tool === "textbox" ? "default" : "ghost"}
                className={cn(
                  "h-8 w-8 cursor-pointer",
                  tool === "textbox" && "bg-primary"
                )}
                onClick={() => setTool("textbox")}
                title="Textbox"
              >
                <Type className="h-4 w-4" />
              </Button>
            </div>

            {/* Zoom Controls */}
            <div className="flex gap-1 p-1 bg-background rounded-md border border-border">
              <Button
                type="button"
                variant="ghost"
                className="h-8 w-8 cursor-pointer"
                onClick={handleZoomOut}
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-8 px-2 cursor-pointer text-xs"
                onClick={handleZoomReset}
                title="Reset Zoom"
              >
                {Math.round(scale * 100)}%
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-8 w-8 cursor-pointer"
                onClick={handleZoomIn}
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-8 w-8 cursor-pointer"
                onClick={handleZoomToFit}
                title="Zoom to Fit"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>

            {/* Color Selection */}
            {(tool === "pen" || tool === "highlight" || tool === "textbox") && (
              <div className="flex gap-1 p-1 bg-background rounded-md border border-border">
                {COLORS.map((c) => (
                  <button
                    type="button"
                    key={c.value}
                    className={cn(
                      "h-8 w-8 rounded cursor-pointer border-2 transition-all",
                      (() => {
                        switch (tool) {
                          case "pen":
                            return penColor === c.value;
                          case "highlight":
                            return highlightColor === c.value;
                          case "textbox":
                            return textboxColor === c.value;
                          default:
                            return false;
                        }
                      })()
                        ? "border-primary scale-110"
                        : "border-transparent hover:scale-105"
                    )}
                    style={{ backgroundColor: c.value }}
                    onClick={() => {
                      switch (tool) {
                        case "pen":
                          setPenColor(c.value);
                          break;
                        case "highlight":
                          setHighlightColor(c.value);
                          break;
                        case "textbox":
                          setTextboxColor(c.value);
                          break;
                      }
                    }}
                    title={c.name}
                  />
                ))}
              </div>
            )}

            {/* Size Selection */}
            {tool !== "eraser" && (
              <div className="flex gap-1 items-center p-1 bg-background rounded-md border border-border">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 w-8 cursor-pointer"
                  onClick={() => {
                    if (tool === "pen") {
                      setPenSize((prev) => Math.max(1, prev - 1));
                    } else if (tool === "highlight") {
                      setHighlightSize((prev) => Math.max(5, prev - 5));
                    } else if (tool === "textbox") {
                      setTextboxFontSize((prev) => Math.max(8, prev - 2));
                    }
                  }}
                  title="Decrease size"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="flex flex-col items-center gap-0.5 px-2">
                  {tool === "textbox" ? (
                    <div className="text-center">
                      <span
                        className="text-sm font-medium"
                        style={{
                          fontSize: `${Math.min(textboxFontSize, 24)}px`,
                          color: textboxColor,
                        }}
                      >
                        A
                      </span>
                      <span className="text-xs text-muted-foreground block">
                        {textboxFontSize}px
                      </span>
                    </div>
                  ) : (
                    <>
                      <div
                        className="rounded-full bg-primary"
                        style={{
                          width: `${Math.min(
                            (tool === "pen" ? penSize : highlightSize) *
                              (tool === "highlight" ? 1 : 2),
                            20
                          )}px`,
                          height: `${Math.min(
                            (tool === "pen" ? penSize : highlightSize) *
                              (tool === "highlight" ? 1 : 2),
                            20
                          )}px`,
                        }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {tool === "pen" ? penSize : highlightSize}px
                      </span>
                    </>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 w-8 cursor-pointer"
                  onClick={() => {
                    if (tool === "pen") {
                      setPenSize((prev) => Math.min(20, prev + 1));
                    } else if (tool === "highlight") {
                      setHighlightSize((prev) => Math.min(50, prev + 5));
                    } else if (tool === "textbox") {
                      setTextboxFontSize((prev) => Math.min(48, prev + 2));
                    }
                  }}
                  title="Increase size"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Eraser Size Selection */}
            {tool === "eraser" && (
              <div className="flex gap-1 items-center p-1 bg-background rounded-md border border-border">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 w-8 cursor-pointer"
                  onClick={() => setEraserSize((prev) => Math.max(5, prev - 5))}
                  title="Decrease eraser size"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="flex flex-col items-center gap-0.5 px-2">
                  <div
                    className="rounded-full bg-destructive"
                    style={{
                      width: `${Math.min(eraserSize, 30)}px`,
                      height: `${Math.min(eraserSize, 30)}px`,
                    }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {eraserSize}px
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 w-8 cursor-pointer"
                  onClick={() =>
                    setEraserSize((prev) => Math.min(50, prev + 5))
                  }
                  title="Increase eraser size"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              title="Undo last action"
            >
              <Undo className="h-4 w-4" />
              Undo
            </Button>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              title="Redo last undone action"
            >
              <Redo className="h-4 w-4" />
              Redo
            </Button>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={handleClear}
              title="Clear all annotations"
            >
              <RotateCcw className="h-4 w-4" />
              Clear
            </Button>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={handleSaveAnnotation}
              title="Save annotations"
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
            <Button
              type="button"
              variant="default"
              className="cursor-pointer"
              onClick={handleExport}
              title="Export combined annotated image"
            >
              <Download className="h-4 w-4" />
              Export Combined
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center w-full">
        <div
          className={cn(
            "border rounded-lg overflow-hidden bg-white",
            isEditMode && "ring-2 ring-primary/20"
          )}
          style={{
            width: canvasDimensions.width,
            height: canvasDimensions.height,
          }}
        >
          <Stage
            ref={(stage) => {
              console.log(
                "Stage ref set:",
                stage,
                "Dimensions:",
                canvasDimensions
              );
              stageRef.current = stage;
            }}
            width={canvasDimensions.width}
            height={canvasDimensions.height}
            scaleX={scale}
            scaleY={scale}
            x={stagePosition.x}
            y={stagePosition.y}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
            style={{
              cursor: isEditMode
                ? isDragging
                  ? "grabbing"
                  : tool === "select"
                  ? "grab"
                  : "crosshair"
                : "default",
              display: "block",
              position: "relative",
            }}
          >
            {/* Images Layer (bottom) */}
            <Layer>
              {images.map(
                (imgData, index) =>
                  imgData.image && (
                    <KonvaImage
                      key={`${imgData.src}-${index}`}
                      image={imgData.image}
                      x={imgData.x}
                      y={imgData.y}
                      width={imgData.width}
                      height={imgData.height}
                    />
                  )
              )}
            </Layer>
            {/* Annotations Layer (top) */}
            <Layer>
              {lines
                .filter((line) => line.tool !== "eraser") // Don't render eraser lines
                .map((line, i) => {
                  console.log(`Rendering Line ${i}:`, line);
                  return (
                    <Line
                      key={i}
                      points={line.points}
                      stroke={line.color}
                      strokeWidth={line.strokeWidth}
                      tension={0}
                      lineCap="round"
                      lineJoin="round"
                      opacity={line.tool === "highlight" ? 0.5 : 1}
                    />
                  );
                })}

              {/* Textboxes */}
              {textboxes.map((textbox) => (
                <Text
                  key={textbox.id}
                  id={textbox.id}
                  name="textbox"
                  x={textbox.x}
                  y={textbox.y}
                  text={textbox.text}
                  fontSize={textbox.fontSize}
                  fill={textbox.color}
                  width={textbox.width}
                  height={textbox.height}
                  align="left"
                  verticalAlign="top"
                  onClick={() => {
                    setSelectedTextboxId(textbox.id);
                    setEditingTextboxId(textbox.id);
                  }}
                  onDblClick={() => {
                    setSelectedTextboxId(textbox.id);
                    setEditingTextboxId(textbox.id);
                  }}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();
                    node.scaleX(1);
                    node.scaleY(1);
                    setTextboxes((prev) =>
                      prev.map((tb) =>
                        tb.id === textbox.id
                          ? {
                              ...tb,
                              x: node.x(),
                              y: node.y(),
                              width: tb.width * scaleX,
                              height: tb.height * scaleY,
                            }
                          : tb
                      )
                    );
                  }}
                  draggable={isEditMode}
                  onDragEnd={(e) => {
                    const node = e.target;
                    setTextboxes((prev) =>
                      prev.map((tb) =>
                        tb.id === textbox.id
                          ? { ...tb, x: node.x(), y: node.y() }
                          : tb
                      )
                    );
                  }}
                />
              ))}

              {/* Transformer for selected textbox */}
              {selectedTextboxId && (
                <Transformer
                  ref={(transformer) => {
                    transformerRef.current = transformer;
                    if (transformer && stageRef.current) {
                      const selectedNode = stageRef.current.findOne(
                        `#${selectedTextboxId}`
                      );
                      if (selectedNode) {
                        transformer.nodes([selectedNode]);
                      }
                    }
                  }}
                  enabledAnchors={[
                    "top-left",
                    "top-right",
                    "bottom-left",
                    "bottom-right",
                  ]}
                  boundBoxFunc={(oldBox, newBox) => {
                    if (newBox.width < 50 || newBox.height < 20) {
                      return oldBox;
                    }
                    return newBox;
                  }}
                />
              )}
            </Layer>
          </Stage>
        </div>
      </div>

      {imageUrls.length > 1 && (
        <div className="text-center text-sm text-muted-foreground">
          {imageUrls.length} images combined in canvas
        </div>
      )}
    </div>
  );
};
