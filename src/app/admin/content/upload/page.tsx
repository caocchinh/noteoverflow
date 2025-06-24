"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  CurriculumType,
  SubjectType,
  ValidTabs,
} from "@/features/admin/content/constants/types";
import EnhancedSelect from "@/features/admin/content/components/EnhancedSelect";
import {
  validatePaperType,
  validateSeason,
  validateYear,
  validateQuestionNumber,
  validateSubject,
  validatePaperVariant,
  paperCodeParser,
  seasonToCode,
  uploadImage,
  validateTopic,
  validateCurriculum,
} from "@/features/admin/content/lib/utils";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import FileDrop from "@/features/admin/content/components/FileDrop";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { toast } from "sonner";
import ReorderableImageList from "@/features/admin/content/components/ReorderableImageList";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, ArrowRight, Loader2, Upload } from "lucide-react";
import { Tabs, TabsTrigger, TabsContent, TabsList } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BAD_REQUEST,
  FAILED_TO_UPLOAD_IMAGE,
  INTERNAL_SERVER_ERROR,
  MAX_FILE_SIZE,
  FILE_SIZE_EXCEEDS_LIMIT,
  ONLY_WEBP_FILES_ALLOWED,
} from "@/constants/constants";
import {
  getCurriculumAction,
  getSubjectByCurriculumAction,
  getSubjectInfoAction,
  isQuestionExistsAction,
  createQuestionImageAction,
  createAnswerAction,
} from "@/server/actions";
import { uploadAction } from "@/features/admin/content/server/actions";
import { parseQuestionId } from "@/lib/utils";
import { ValidSeason } from "@/constants/types";
import {
  YEAR_LABELS,
  YEAR_PLACEHOLDERS,
  PAPER_TYPE_LABELS,
  PAPER_TYPE_PLACEHOLDERS,
  SEASON_LABELS,
  SEASON_PLACEHOLDERS,
  CURRICULUM_LABELS,
  CURRICULUM_PLACEHOLDERS,
  SUBJECT_LABELS,
  SUBJECT_PLACEHOLDERS,
  TOPIC_LABELS,
  TOPIC_PLACEHOLDERS,
} from "@/features/admin/content/constants/constants";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const UploadPage = () => {
  const [selectedCurriculum, setSelectedCurriculum] = useState<
    string | undefined
  >(undefined);
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>(
    undefined
  );
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>(
    undefined
  );
  const [selectedPaperType, setSelectedPaperType] = useState<
    string | undefined
  >(undefined);
  const [selectedSeason, setSelectedSeason] = useState<ValidSeason | "">("");
  const [selectedYear, setSelectedYear] = useState<string | undefined>(
    undefined
  );
  const queryClient = useQueryClient();
  const [questionNumber, setQuestionNumber] = useState<string>("");
  const [questionNumberError, setQuestionNumberError] = useState<string>("");
  const [isMultipleChoice, setIsMultipleChoice] = useState<boolean>(false);
  const [multipleChoiceInput, setMultipleChoiceInput] = useState<string>("A");
  const [questionImages, setQuestionImages] = useState<File[]>([]);
  const [answerImages, setAnswerImages] = useState<File[]>([]);
  const [imageDialogOpen, setImageDialogOpen] = useState<boolean>(false);
  const [imageDialogImage, setImageDialogImage] = useState<string | undefined>(
    undefined
  );
  const [currentTab, setCurrentTab] = useState<ValidTabs>("information");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState<boolean>(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [paperVariantInput, setPaperVariantInput] = useState<string>("");
  const [paperVariantError, setPaperVariantError] = useState<string>("");
  const canUpload = useMemo(() => {
    return (
      isUploading ||
      !selectedCurriculum ||
      !selectedSubject ||
      !selectedTopic ||
      !selectedPaperType ||
      !selectedSeason ||
      !selectedYear ||
      questionNumber == "" ||
      questionNumberError != "" ||
      paperVariantInput == "" ||
      paperVariantError != "" ||
      questionImages.length === 0 ||
      (isMultipleChoice && multipleChoiceInput === "") ||
      questionImages.length === 0 ||
      (answerImages.length === 0 && !isMultipleChoice)
    );
  }, [
    answerImages.length,
    isMultipleChoice,
    isUploading,
    multipleChoiceInput,
    questionImages.length,
    questionNumber,
    questionNumberError,
    selectedCurriculum,
    selectedPaperType,
    selectedSeason,
    selectedSubject,
    selectedTopic,
    selectedYear,
    paperVariantInput,
    paperVariantError,
  ]);

  const {
    data: curriculumData,
    isFetching: isCurriculumFetching,
    refetch: refetchCurriculum,
    isRefetching: isCurriculumRefetching,
    error: curriculumError,
    isError: isCurriculumError,
  } = useQuery({
    queryKey: ["curriculum"],
    queryFn: async (): Promise<CurriculumType[]> => {
      try {
        const { success, data, error } = await getCurriculumAction();
        if (!success) {
          throw new Error(error || "Failed to fetch curriculum data");
        }
        return data!;
      } catch (error) {
        toast.error("Failed to fetch curriculum data");
        throw error;
      }
    },
    select: (data) => {
      if (data.length > 0 && !selectedCurriculum) {
        setSelectedCurriculum(data[0].name);
      }
      return data;
    },
    retry: false,
  });

  const {
    data: subject,
    error: subjectError,
    isError: isSubjectError,
    refetch: refetchSubject,
    isFetching: isSubjectFetching,
  } = useQuery({
    queryKey: ["subject", selectedCurriculum],
    queryFn: async (): Promise<SubjectType[]> => {
      try {
        const { success, data, error } = await getSubjectByCurriculumAction(
          selectedCurriculum ?? ""
        );
        if (!success) {
          throw new Error(error || "Failed to fetch subject data");
        }
        return data!;
      } catch (error) {
        toast.error("Failed to fetch subject data");
        throw error;
      }
    },
    enabled: !!selectedCurriculum,
    retry: false,
  });

  const {
    data: subjectInfo,
    isFetching: isSubjectInfoFetching,
    error: subjectInfoError,
    isError: isSubjectInfoError,
    refetch: refetchSubjectInfo,
  } = useQuery({
    queryKey: ["subjectInfo", selectedSubject],
    queryFn: async () => {
      try {
        const { success, data, error } = await getSubjectInfoAction(
          selectedSubject ?? ""
        );
        if (!success) {
          throw new Error(error || "Failed to fetch subject information");
        }
        return data!;
      } catch (error) {
        toast.error("Failed to fetch subject information");
        throw error;
      }
    },
    enabled: !!selectedSubject,
    retry: false,
  });

  const handleCurriculumChange = (item: string) => {
    setSelectedCurriculum(item);
    setSelectedSubject("");
    setSelectedTopic("");
    setSelectedPaperType("");
    setSelectedSeason("");
    setSelectedYear("");
  };

  const handleSubjectChange = (item: string) => {
    setSelectedSubject(item);
    setSelectedTopic("");
    setSelectedPaperType("");
    setSelectedSeason("");
    setSelectedYear("");
  };

  const handlePaperVariantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPaperVariantInput(value);
    if (value === "") {
      setPaperVariantError("");
    } else {
      setPaperVariantError(validatePaperVariant(value));
    }
  };

  const handleQuestionNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setQuestionNumber(value);

    if (value === "") {
      setQuestionNumberError("");
    } else {
      setQuestionNumberError(validateQuestionNumber(value));
    }
  };

  const handleFileInput = (files: FileList, type: "question" | "answer") => {
    for (const file of files) {
      if (file.type != "image/webp") {
        toast.error(ONLY_WEBP_FILES_ALLOWED);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(FILE_SIZE_EXCEEDS_LIMIT);
        return;
      }
    }
    if (files.length === 0) {
      toast.error("No files selected");
      return;
    }

    if (type === "question") {
      if (questionImages.length + files.length > 9) {
        toast.error("You can only upload up to 9 images");
        return;
      }
      for (const file of files) {
        if (questionImages.some((image) => image.name === file.name)) {
          toast.error("Image already exists");
          return;
        }
      }
      setQuestionImages((prev) => [...prev, ...files]);
    } else {
      if (answerImages.length + files.length > 9) {
        toast.error("You can only upload up to 9 images");
        return;
      }
      for (const file of files) {
        if (answerImages.some((image) => image.name === file.name)) {
          toast.error("Image already exists");
          return;
        }
      }
      setAnswerImages((prev) => [...prev, ...files]);
    }
  };

  const handleRemoveQuestionImage = (index: number) => {
    setQuestionImages(questionImages.filter((_, i) => i !== index));
  };

  const handleRemoveAnswerImage = (index: number) => {
    setAnswerImages(answerImages.filter((_, i) => i !== index));
  };

  const resetAllInputs = async () => {
    setSelectedCurriculum("");
    setCurrentTab("refetching");
    setSelectedSubject("");
    setSelectedTopic("");
    setSelectedPaperType("");
    setSelectedSeason("");
    setSelectedYear("");
    setQuestionNumber("");
    setQuestionNumberError("");
    setIsMultipleChoice(false);
    setMultipleChoiceInput("A");
    setQuestionImages([]);
    setAnswerImages([]);
    queryClient.setQueryData(["curriculum"], []);
    queryClient.setQueryData(["subject"], []);
    queryClient.setQueryData(["topic"], []);
    queryClient.setQueryData(["paperType"], []);
    queryClient.setQueryData(["season"], []);
    queryClient.setQueryData(["year"], []);
    await refetchCurriculum();
    setIsResetDialogOpen(false);
  };

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      const paperCode = paperCodeParser({
        subjectCode: selectedSubject!.split("(")[1].slice(0, -1),
        paperType: selectedPaperType!,
        variant: paperVariantInput!,
        season: selectedSeason as ValidSeason,
        year: selectedYear!,
      });
      const { success, data, error } = await isQuestionExistsAction(
        parseQuestionId({
          subject: selectedSubject!,
          paperCode: paperCode,
          questionNumber: questionNumber!,
        })
      );
      if (!success) {
        if (error === INTERNAL_SERVER_ERROR) {
          throw new Error(INTERNAL_SERVER_ERROR);
        } else if (error === BAD_REQUEST) {
          throw new Error(BAD_REQUEST);
        } else {
          throw new Error(error || "Unknown error");
        }
      }
      if (data) {
        throw new Error(
          "Question already exists! If you want to overwrite it, please use the update page."
        );
      }
      const { success: success2, error: error2 } = await uploadAction({
        questionId: parseQuestionId({
          subject: selectedSubject!,
          paperCode: paperCode,
          questionNumber: questionNumber!,
        }),
        year: parseInt(selectedYear!),
        season: selectedSeason as ValidSeason,
        paperType: parseInt(selectedPaperType!),
        paperVariant: parseInt(paperVariantInput!),
        curriculumName: selectedCurriculum!,
        subjectId: selectedSubject!,
        topic: selectedTopic!,
        questionNumber: parseInt(questionNumber!),
      });
      if (!success2) {
        if (error2 === INTERNAL_SERVER_ERROR) {
          throw new Error(INTERNAL_SERVER_ERROR);
        } else if (error2 === BAD_REQUEST) {
          throw new Error(BAD_REQUEST);
        } else {
          throw new Error(error2 || "Unknown error");
        }
      }

      // Upload and create all question images in parallel
      await Promise.all(
        questionImages.map(async (image, index) => {
          const { success, data, error } = await uploadImage({
            file: image,
            subjectFullName: selectedSubject!,
            paperCode: paperCode,
            contentType: "questions",
            questionNumber: questionNumber!,
            order: index,
          });
          if (!success) {
            if (error === INTERNAL_SERVER_ERROR) {
              throw new Error(INTERNAL_SERVER_ERROR);
            } else if (error === BAD_REQUEST) {
              throw new Error(BAD_REQUEST);
            } else if (error === FILE_SIZE_EXCEEDS_LIMIT) {
              throw new Error(FILE_SIZE_EXCEEDS_LIMIT);
            } else if (error === ONLY_WEBP_FILES_ALLOWED) {
              throw new Error(ONLY_WEBP_FILES_ALLOWED);
            } else {
              throw new Error(FAILED_TO_UPLOAD_IMAGE);
            }
          }
          const { success: success2, error: error2 } =
            await createQuestionImageAction({
              questionId: parseQuestionId({
                subject: selectedSubject!,
                paperCode: paperCode,
                questionNumber: questionNumber!,
              }),
              imageSrc: data!.imageSrc,
              order: index,
            });
          if (!success2) {
            if (error2 === INTERNAL_SERVER_ERROR) {
              throw new Error(INTERNAL_SERVER_ERROR);
            } else {
              throw new Error(
                error2 || "Unknown error creating question image"
              );
            }
          }
        })
      );
      if (isMultipleChoice) {
        const { success: success2, error: error2 } = await createAnswerAction({
          questionId: parseQuestionId({
            subject: selectedSubject!,
            paperCode: paperCode,
            questionNumber: questionNumber!,
          }),
          answerImageSrc: multipleChoiceInput,
          answerOrder: 0,
        });
        if (!success2) {
          if (error2 === INTERNAL_SERVER_ERROR) {
            throw new Error(INTERNAL_SERVER_ERROR);
          } else if (error2 === BAD_REQUEST) {
            throw new Error(BAD_REQUEST);
          } else {
            throw new Error(error2 || "Unknown error creating answer");
          }
        }
      } else {
        // Upload and create all answer images in parallel
        await Promise.all(
          answerImages.map(async (image, index) => {
            const { success, data, error } = await uploadImage({
              file: image,
              subjectFullName: selectedSubject!,
              paperCode: paperCode,
              contentType: "answers",
              questionNumber: questionNumber!,
              order: index,
            });
            if (!success) {
              if (error === INTERNAL_SERVER_ERROR) {
                throw new Error(INTERNAL_SERVER_ERROR);
              } else if (error === BAD_REQUEST) {
                throw new Error(BAD_REQUEST);
              } else if (error === FILE_SIZE_EXCEEDS_LIMIT) {
                throw new Error(FILE_SIZE_EXCEEDS_LIMIT);
              } else if (error === ONLY_WEBP_FILES_ALLOWED) {
                throw new Error(ONLY_WEBP_FILES_ALLOWED);
              } else {
                throw new Error(FAILED_TO_UPLOAD_IMAGE);
              }
            }

            const { success: success2, error: error2 } =
              await createAnswerAction({
                questionId: parseQuestionId({
                  subject: selectedSubject!,
                  paperCode: paperCode,
                  questionNumber: questionNumber!,
                }),
                answerImageSrc: data!.imageSrc,
                answerOrder: index,
              });
            if (!success2) {
              if (error2 === INTERNAL_SERVER_ERROR) {
                throw new Error(INTERNAL_SERVER_ERROR);
              } else if (error2 === BAD_REQUEST) {
                throw new Error(BAD_REQUEST);
              } else {
                throw new Error(error2 || "Unknown error creating answer");
              }
            }
          })
        );
      }

      await resetAllInputs();
      toast.success("Question uploaded successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsUploadDialogOpen(false);
      setIsUploading(false);
    }
  };

  return (
    <>
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogDescription className="sr-only">Preview Image</DialogDescription>
        <DialogContent
          onClick={() => setImageDialogOpen(false)}
          className="max-h-[70vh] overflow-y-auto"
        >
          <DialogTitle className="sr-only">Upload Image</DialogTitle>
          <Image
            src={imageDialogImage!}
            alt="Upload Image"
            width={100}
            height={100}
            className="w-[100%] h-max object-contain border-2 border-transparent hover:border-red-500"
          />
        </DialogContent>
      </Dialog>
      <div className="flex flex-row gap-8 items-start justify-evenly mt-4 w-full flex-wrap">
        <div className="flex flex-col flex-wrap gap-4 items-start justify-start border-2 border-foreground-muted rounded-md p-4 w-full sm:w-[350px] bg-card">
          <h1 className="text-xl font-semibold text-center w-full">
            Information
          </h1>
          {isCurriculumError && (
            <div className="w-full p-2 bg-red-100 border border-red-400 text-red-700 rounded mb-2">
              <p className="text-sm">
                Error loading curriculum: {curriculumError?.message}
              </p>
              <Button
                size="sm"
                onClick={() => refetchCurriculum()}
                className="mt-1 cursor-pointer"
                variant="outline"
              >
                Retry
              </Button>
            </div>
          )}
          <EnhancedSelect
            selectedValue={selectedCurriculum}
            onValueChange={handleCurriculumChange}
            existingItems={curriculumData?.map((item) => item.name) ?? []}
            placeholders={CURRICULUM_PLACEHOLDERS}
            labels={CURRICULUM_LABELS}
            isLoading={isCurriculumFetching || isCurriculumRefetching}
            validator={validateCurriculum}
          />
          <EnhancedSelect
            selectedValue={selectedSubject}
            onValueChange={handleSubjectChange}
            existingItems={subject?.map((item) => item.id) ?? []}
            placeholders={SUBJECT_PLACEHOLDERS}
            labels={SUBJECT_LABELS}
            isLoading={isSubjectFetching}
            disabled={
              !selectedCurriculum ||
              isCurriculumRefetching ||
              isCurriculumFetching ||
              isSubjectFetching
            }
            validator={validateSubject}
          />
          {isSubjectError && (
            <div className="w-full p-2 bg-red-100 border border-red-400 text-red-700 rounded mb-2">
              <p className="text-sm">
                Error loading subjects: {subjectError?.message}
              </p>
              <Button
                size="sm"
                onClick={() => refetchSubject()}
                className="mt-1 cursor-pointer"
                variant="outline"
              >
                Retry
              </Button>
            </div>
          )}
          {isSubjectInfoError && (
            <div className="w-full p-2 bg-red-100 border border-red-400 text-red-700 rounded mb-2 ">
              <p className="text-sm">
                Error loading subject information: {subjectInfoError?.message}
              </p>
              <Button
                size="sm"
                onClick={() => refetchSubjectInfo()}
                className="mt-1 cursor-pointer !bg-white !text-red-700"
                variant="outline"
              >
                Retry
              </Button>
            </div>
          )}
          <EnhancedSelect
            selectedValue={selectedTopic}
            onValueChange={setSelectedTopic}
            existingItems={subjectInfo?.topicData ?? []}
            validator={validateTopic}
            placeholders={TOPIC_PLACEHOLDERS}
            labels={TOPIC_LABELS}
            isLoading={isSubjectInfoFetching && !!selectedSubject}
            disabled={!selectedSubject}
          />
          <EnhancedSelect
            selectedValue={selectedPaperType}
            onValueChange={setSelectedPaperType}
            existingItems={
              subjectInfo?.paperTypeData?.map((item) => item.toString()) ?? []
            }
            placeholders={PAPER_TYPE_PLACEHOLDERS}
            labels={PAPER_TYPE_LABELS}
            isLoading={isSubjectInfoFetching && !!selectedSubject}
            disabled={!selectedSubject}
            validator={validatePaperType}
            inputType="number"
          />
          <EnhancedSelect
            selectedValue={selectedSeason}
            onValueChange={(item) => setSelectedSeason(item as ValidSeason)}
            existingItems={subjectInfo?.seasonData ?? []}
            placeholders={SEASON_PLACEHOLDERS}
            labels={SEASON_LABELS}
            isLoading={isSubjectInfoFetching && !!selectedSubject}
            disabled={!selectedSubject}
            validator={validateSeason}
          />
          <EnhancedSelect
            selectedValue={selectedYear}
            onValueChange={setSelectedYear}
            existingItems={
              subjectInfo?.yearData?.map((item) => item.toString()) ?? []
            }
            placeholders={YEAR_PLACEHOLDERS}
            labels={YEAR_LABELS}
            isLoading={isSubjectInfoFetching && !!selectedSubject}
            disabled={!selectedSubject}
            validator={validateYear}
            inputType="number"
          />
          <div className="flex flex-col w-full">
            <Label htmlFor="questionNumber" className="mb-2">
              Question Number
            </Label>
            <Input
              type="number"
              placeholder="Enter question number"
              value={questionNumber}
              onChange={handleQuestionNumberChange}
              className={cn(
                "w-full",
                questionNumberError ? "border-red-500" : ""
              )}
              id="questionNumber"
            />
            {questionNumberError && (
              <span className="text-red-500 text-sm mt-1">
                {questionNumberError}
              </span>
            )}
          </div>
          <div className="flex flex-col w-full">
            <Label htmlFor="paperVariant" className="mb-2">
              Paper Variant
            </Label>
            <Input
              type="number"
              placeholder="Enter paper variant"
              value={paperVariantInput}
              onChange={handlePaperVariantChange}
              className={cn(
                "w-full",
                paperVariantError ? "border-red-500" : ""
              )}
              id="paperVariant"
            />
            {paperVariantError && (
              <span className="text-red-500 text-sm mt-1">
                {paperVariantError}
              </span>
            )}
          </div>
          <div className="flex flex-row w-full items-center justify-start gap-2">
            <Label htmlFor="isMultipleChoice">Is Multiple Choice?</Label>
            <Switch
              id="isMultipleChoice"
              className="cursor-pointer"
              checked={isMultipleChoice}
              onCheckedChange={setIsMultipleChoice}
            />
          </div>
        </div>
        <div className="flex flex-col  gap-4 items-center justify-center w-full sm:w-max">
          <div className="flex flex-row w-full gap-12 items-start justify-center flex-wrap">
            <div className="flex flex-col w-max gap-4 items-center justify-center">
              <h1 className="text-xl font-semibold text-center w-full">
                Question
              </h1>
              <ReorderableImageList
                images={questionImages}
                onReorder={setQuestionImages}
                onRemoveImage={handleRemoveQuestionImage}
                onViewImage={(imageUrl) => {
                  setImageDialogOpen(true);
                  setImageDialogImage(imageUrl);
                }}
              />
              <FileDrop
                handleDrop={(e) => {
                  e.preventDefault();
                  handleFileInput(e.dataTransfer.files, "question");
                }}
                handleInputChange={(e) => {
                  e.preventDefault();
                  handleFileInput(e.target.files ?? new FileList(), "question");
                }}
              />
            </div>
            {!isMultipleChoice ? (
              <div className="flex flex-col w-max gap-4 items-center justify-center">
                <h1 className="text-xl font-semibold text-center w-full">
                  Answer
                </h1>
                <ReorderableImageList
                  images={answerImages}
                  onReorder={setAnswerImages}
                  onRemoveImage={handleRemoveAnswerImage}
                  onViewImage={(imageUrl) => {
                    setImageDialogOpen(true);
                    setImageDialogImage(imageUrl);
                  }}
                />
                <FileDrop
                  handleDrop={(e) => {
                    e.preventDefault();
                    handleFileInput(e.dataTransfer.files, "answer");
                  }}
                  handleInputChange={(e) => {
                    e.preventDefault();
                    handleFileInput(e.target.files ?? new FileList(), "answer");
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-col w-max gap-4 items-center justify-center">
                <h1 className="text-xl font-semibold text-center w-full">
                  Answer
                </h1>
                <RadioGroup
                  defaultValue="A"
                  value={multipleChoiceInput}
                  onValueChange={(value) => setMultipleChoiceInput(value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="A" id="A" />
                    <Label htmlFor="A">A</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="B" id="B" />
                    <Label htmlFor="B">B</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="C" id="C" />
                    <Label htmlFor="C">C</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="D" id="D" />
                    <Label htmlFor="D">D</Label>
                  </div>
                </RadioGroup>
                <div className="flex flex-col w-full">
                  <Label htmlFor="multipleChoiceInput" className="mb-2">
                    Other
                  </Label>
                  <Input
                    id="multipleChoiceInput"
                    placeholder="Enter answer"
                    value={multipleChoiceInput}
                    onChange={(e) => setMultipleChoiceInput(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-row gap-4 mt-4 w-full items-center justify-center">
            <AlertDialog
              open={isUploadDialogOpen}
              onOpenChange={setIsUploadDialogOpen}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex-1">
                    {!canUpload ? (
                      <Button
                        className="w-full cursor-pointer"
                        onClick={() => {
                          setCurrentTab("information");
                          setIsUploadDialogOpen(true);
                        }}
                      >
                        {isUploading ? "Uploading..." : "Upload"}
                      </Button>
                    ) : (
                      <Button className="w-full cursor-pointer" disabled={true}>
                        Complete all fields
                      </Button>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent className={cn(!canUpload && "hidden")}>
                  {!selectedCurriculum && <p>-Curriculumn</p>}
                  {!selectedSubject && <p>-Subject</p>}
                  {!selectedTopic && <p>-Topic</p>}
                  {!selectedPaperType && <p>-Paper Type</p>}
                  {!selectedSeason && <p>-Season</p>}
                  {!selectedYear && <p>-Year</p>}
                  {!questionNumber && <p>-Question Number</p>}
                  {!paperVariantInput && <p>-Paper Variant</p>}
                  {isMultipleChoice && !multipleChoiceInput && (
                    <p>-Multiple Choice Answer</p>
                  )}
                  {!questionImages.length && <p>-Question Image</p>}
                  {!answerImages.length && !isMultipleChoice && (
                    <p>-Answer Image</p>
                  )}
                </TooltipContent>
              </Tooltip>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Question Upload</AlertDialogTitle>
                  <AlertDialogDescription>
                    Please review the following information before uploading
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Tabs
                  defaultValue="information"
                  className="w-full"
                  value={currentTab}
                  onValueChange={(value) => setCurrentTab(value as ValidTabs)}
                >
                  <TabsList>
                    <TabsTrigger
                      value="information"
                      className="cursor-pointer"
                      disabled={isCurriculumRefetching}
                    >
                      Information
                    </TabsTrigger>
                    <TabsTrigger
                      value="image-preview"
                      className="cursor-pointer"
                      disabled={isCurriculumRefetching}
                    >
                      Image Preview
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="information">
                    <div className="grid grid-cols-2 gap-2 my-4">
                      <div className="font-semibold">Curriculum:</div>
                      <div>{selectedCurriculum}</div>
                      <div className="font-semibold">Subject:</div>
                      <div>{selectedSubject}</div>
                      <div className="font-semibold">Topic:</div>
                      <div>{selectedTopic}</div>
                      <div className="font-semibold">Paper Type:</div>
                      <div>{selectedPaperType}</div>
                      <div className="font-semibold">Season:</div>
                      <div>
                        {selectedSeason} {"("}
                        {seasonToCode(
                          selectedSeason as "Summer" | "Winter" | "Spring"
                        )}
                        {")"}
                      </div>
                      <div className="font-semibold">Year:</div>
                      <div>{selectedYear}</div>
                      <div className="font-semibold">Question Number:</div>
                      <div>{questionNumber}</div>
                      <div className="font-semibold">Paper Variant:</div>
                      <div>{paperVariantInput}</div>
                      <div className="font-semibold">Question Type:</div>
                      <div>
                        {isMultipleChoice ? "Multiple Choice" : "Theory (FRQ)"}
                      </div>
                    </div>
                    <Button
                      className="w-full cursor-pointer"
                      onClick={() => setCurrentTab("image-preview")}
                    >
                      Next <ArrowRight className="w-4 h-4" />
                    </Button>
                  </TabsContent>
                  <TabsContent value="image-preview">
                    <div className="flex flex-col gap-2 mt-2 w-full items-start justify-center">
                      <h4 className="font-semibold">
                        Question (ordered by order)
                      </h4>
                      <ScrollArea
                        className={cn(
                          "w-full",
                          isMultipleChoice ? "h-[150px]" : "h-[100px]"
                        )}
                      >
                        <div className="w-full flex flex-col gap-2 items-start justify-center ">
                          {questionImages.map((image, index) => (
                            <div
                              className="flex flex-row w-full gap-2 items-center justify-center"
                              key={index}
                            >
                              <p>{index + 1}.</p>
                              <Button
                                className="flex-1 cursor-pointer"
                                variant="outline"
                                onClick={() => {
                                  setImageDialogOpen(true);
                                  setImageDialogImage(
                                    URL.createObjectURL(image)
                                  );
                                }}
                              >
                                {image.name}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <h4 className="font-semibold mt-6">
                        Answer {!isMultipleChoice ? "(ordered by order)" : ""}
                      </h4>
                      {isMultipleChoice ? (
                        <div className="w-full">
                          <p>Answer: {multipleChoiceInput}</p>
                        </div>
                      ) : (
                        <ScrollArea className="w-full h-[100px]">
                          <div className="w-full flex flex-col gap-2 items-start justify-center">
                            {answerImages.map((image, index) => (
                              <div
                                className="flex flex-row w-full gap-2 items-center justify-center"
                                key={index}
                              >
                                <p>{index + 1}.</p>
                                <Button
                                  className="flex-1 cursor-pointer"
                                  variant="outline"
                                  onClick={() => {
                                    setImageDialogOpen(true);
                                    setImageDialogImage(
                                      URL.createObjectURL(image)
                                    );
                                  }}
                                >
                                  {image.name}
                                </Button>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </div>
                    <div className="flex flex-row gap-4 mt-5 items-center justify-center">
                      <Button
                        className="flex-1 cursor-pointer"
                        onClick={() => setCurrentTab("information")}
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </Button>
                      <Button
                        className="flex-1 cursor-pointer"
                        disabled={canUpload}
                        onClick={handleUpload}
                      >
                        {isUploading ? (
                          <>
                            Uploading...
                            <Loader2 className="w-4 h-4 animate-spin" />
                          </>
                        ) : (
                          <>
                            Upload <Upload className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="refetching">
                    <div className="flex flex-col gap-2 mt-2 w-full items-center justify-center">
                      <h4 className="font-semibold">Refetching...</h4>
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  </TabsContent>
                </Tabs>

                <AlertDialogFooter className="flex flex-row gap-4 items-center justify-center">
                  <AlertDialogCancel
                    className="flex-1 cursor-pointer"
                    disabled={isUploading || isCurriculumRefetching}
                  >
                    Cancel
                  </AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog
              open={isResetDialogOpen}
              onOpenChange={setIsResetDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1 cursor-pointer"
                  disabled={isCurriculumFetching}
                >
                  Reset all inputs
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-center">
                    Reset all inputs
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-center">
                    Are you absolutely sure you want to reset all inputs? New
                    values will be kept for the new items you have added.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex flex-row gap-4 items-center justify-center">
                  <AlertDialogCancel
                    className="flex-1 cursor-pointer"
                    disabled={isCurriculumRefetching}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <Button
                    className="flex-1 cursor-pointer"
                    onClick={resetAllInputs}
                    disabled={isCurriculumRefetching}
                  >
                    {isCurriculumRefetching ? (
                      <>
                        Resetting...
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </>
                    ) : (
                      "Reset"
                    )}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadPage;
