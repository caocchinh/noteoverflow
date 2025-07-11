"use client";

import { DialogTitle } from "@radix-ui/react-dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Loader2, Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BAD_REQUEST,
  FAILED_TO_UPLOAD_IMAGE,
  FILE_SIZE_EXCEEDS_LIMIT,
  INTERNAL_SERVER_ERROR,
  MAX_FILE_SIZE,
  ONLY_WEBP_FILES_ALLOWED,
} from "@/constants/constants";
import type { ValidSeason } from "@/constants/types";
import EnhancedSelect from "@/features/admin/content/components/EnhancedSelect";
import FileDrop from "@/features/admin/content/components/FileDrop";
import ReorderableImageList from "@/features/admin/content/components/ReorderableImageList";
import {
  CURRICULUM_LABELS,
  CURRICULUM_PLACEHOLDERS,
  PAPER_TYPE_LABELS,
  PAPER_TYPE_PLACEHOLDERS,
  SEASON_LABELS,
  SEASON_PLACEHOLDERS,
  SUBJECT_LABELS,
  SUBJECT_PLACEHOLDERS,
  TOPIC_LABELS,
  TOPIC_PLACEHOLDERS,
  YEAR_LABELS,
  YEAR_PLACEHOLDERS,
} from "@/features/admin/content/constants/constants";
import type {
  CurriculumType,
  SubjectType,
  ValidTabs,
} from "@/features/admin/content/constants/types";
import {
  paperCodeParser,
  validateCurriculum,
  validatePaperType,
  validatePaperVariant,
  validateQuestionNumber,
  validateSeason,
  validateSubject,
  validateTopic,
  validateYear,
} from "@/features/admin/content/lib/utils";
import { uploadImage } from "@/features/admin/lib/utils";
import { uploadAction } from "@/features/admin/content/server/actions";
import { cn, parseQuestionId } from "@/lib/utils";
import {
  createAnswerAction,
  createQuestionImageAction,
  getCurriculumAction,
  getSubjectByCurriculumAction,
  getSubjectInfoAction,
  isQuestionExistsAction,
} from "@/server/actions";

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
      questionNumber === "" ||
      questionNumberError !== "" ||
      paperVariantInput === "" ||
      paperVariantError !== "" ||
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
        return data ?? [];
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
        return data ?? [];
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
          selectedSubject ?? "",
          selectedCurriculum ?? ""
        );
        if (!success) {
          throw new Error(error || "Failed to fetch subject information");
        }
        return data;
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
      if (file.type !== "image/webp") {
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
    const handleError = (error: string | undefined) => {
      if (error === INTERNAL_SERVER_ERROR) {
        throw new Error(INTERNAL_SERVER_ERROR);
      }
      if (error === BAD_REQUEST) {
        throw new Error(BAD_REQUEST);
      }
      if (error === FILE_SIZE_EXCEEDS_LIMIT) {
        throw new Error(FILE_SIZE_EXCEEDS_LIMIT);
      }
      if (error === ONLY_WEBP_FILES_ALLOWED) {
        throw new Error(ONLY_WEBP_FILES_ALLOWED);
      }
      throw new Error(FAILED_TO_UPLOAD_IMAGE);
    };

    setIsUploading(true);
    try {
      const paperCode = paperCodeParser({
        subjectCode: selectedSubject?.split("(")[1].slice(0, -1) ?? "",
        paperType: selectedPaperType ?? "",
        variant: paperVariantInput ?? "",
        season: selectedSeason as ValidSeason,
        year: selectedYear ?? "",
      });
      const { success, data, error } = await isQuestionExistsAction(
        parseQuestionId({
          subject: selectedSubject ?? "",
          paperCode,
          curriculumName: selectedCurriculum ?? "",
          questionNumber: questionNumber ?? "",
        })
      );
      if (!success) {
        handleError(error);
      }
      if (data) {
        throw new Error(
          "Question already exists! If you want to overwrite it, please use the update page."
        );
      }
      const { success: success2, error: error2 } = await uploadAction({
        questionId: parseQuestionId({
          subject: selectedSubject ?? "",
          paperCode,
          curriculumName: selectedCurriculum ?? "",
          questionNumber: questionNumber ?? "",
        }),
        year: Number.parseInt(selectedYear ?? "", 10),
        season: selectedSeason as ValidSeason,
        paperType: Number.parseInt(selectedPaperType ?? "", 10),
        paperVariant: Number.parseInt(paperVariantInput ?? "", 10),
        curriculumName: selectedCurriculum ?? "",
        subjectId: selectedSubject ?? "",
        topic: selectedTopic ?? "",
        questionNumber: Number.parseInt(questionNumber ?? "", 10),
      });
      if (!success2) {
        handleError(error2);
      }

      // Upload and create all question images in parallel
      await Promise.all(
        questionImages.map(async (image, index) => {
          const {
            success: success3,
            data: data3,
            error: error3,
          } = await uploadImage({
            file: image,
            subjectFullName: selectedSubject ?? "",
            paperCode,
            curriculumName: selectedCurriculum ?? "",
            contentType: "questions",
            questionNumber: questionNumber ?? "",
            order: index,
          });
          if (!success3) {
            handleError(error3);
          }
          const { success: success4, error: error4 } =
            await createQuestionImageAction({
              questionId: parseQuestionId({
                subject: selectedSubject ?? "",
                paperCode,
                curriculumName: selectedCurriculum ?? "",
                questionNumber: questionNumber ?? "",
              }),
              imageSrc: data3?.imageSrc ?? "",
              order: index,
            });
          if (!success4) {
            handleError(error4);
          }
        })
      );
      if (isMultipleChoice) {
        const { success: success5, error: error5 } = await createAnswerAction({
          questionId: parseQuestionId({
            subject: selectedSubject ?? "",
            paperCode,
            curriculumName: selectedCurriculum ?? "",
            questionNumber: questionNumber ?? "",
          }),
          answer: multipleChoiceInput,
          answerOrder: 0,
        });
        if (!success5) {
          handleError(error5);
        }
      } else {
        // Upload and create all answer images in parallel
        await Promise.all(
          answerImages.map(async (image, index) => {
            const {
              success: success6,
              data: data6,
              error: error6,
            } = await uploadImage({
              file: image,
              subjectFullName: selectedSubject ?? "",
              paperCode,
              curriculumName: selectedCurriculum ?? "",
              contentType: "answers",
              questionNumber: questionNumber ?? "",
              order: index,
            });
            if (!success6) {
              handleError(error6);
            }

            const { success: success7, error: error7 } =
              await createAnswerAction({
                questionId: parseQuestionId({
                  subject: selectedSubject ?? "",
                  paperCode,
                  curriculumName: selectedCurriculum ?? "",
                  questionNumber: questionNumber ?? "",
                }),
                answer: data6?.imageSrc ?? "",
                answerOrder: index,
              });
            if (!success7) {
              handleError(error7);
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

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (selectedCurriculum) {
        e.preventDefault();
      }
    };

    if (selectedCurriculum) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [selectedCurriculum]);

  return (
    <>
      <div>
        <Dialog onOpenChange={setImageDialogOpen} open={imageDialogOpen}>
          <DialogDescription className="sr-only">
            Preview Image
          </DialogDescription>
          <DialogContent
            className="max-h-[70vh] overflow-y-auto"
            onClick={() => setImageDialogOpen(false)}
          >
            <DialogTitle className="sr-only">Upload Image</DialogTitle>
            <Image
              alt="Upload Image"
              className="h-max w-[100%] border-2 border-transparent object-contain hover:border-red-500"
              height={100}
              src={imageDialogImage ?? ""}
              width={100}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="mt-4 flex w-full flex-row flex-wrap items-start justify-evenly gap-8">
        <div className="flex w-full flex-col flex-wrap items-start justify-start gap-4 rounded-md border-2 border-foreground-muted bg-card p-4 sm:w-[350px]">
          <h1 className="w-full text-center font-semibold text-xl">
            Information
          </h1>
          {isCurriculumError && (
            <div className="mb-2 w-full rounded border border-red-400 bg-red-100 p-2 text-red-700">
              <p className="text-sm">
                Error loading curriculum: {curriculumError?.message}
              </p>
              <Button
                className="mt-1 cursor-pointer"
                onClick={() => refetchCurriculum()}
                size="sm"
                variant="outline"
              >
                Retry
              </Button>
            </div>
          )}
          <EnhancedSelect
            existingItems={curriculumData?.map((item) => item.name) ?? []}
            isLoading={isCurriculumFetching || isCurriculumRefetching}
            labels={CURRICULUM_LABELS}
            onValueChange={handleCurriculumChange}
            placeholders={CURRICULUM_PLACEHOLDERS}
            selectedValue={selectedCurriculum}
            validator={validateCurriculum}
          />
          <EnhancedSelect
            disabled={
              !selectedCurriculum ||
              isCurriculumRefetching ||
              isCurriculumFetching ||
              isSubjectFetching
            }
            existingItems={subject?.map((item) => item.subjectId) ?? []}
            isLoading={isSubjectFetching}
            labels={SUBJECT_LABELS}
            onValueChange={handleSubjectChange}
            placeholders={SUBJECT_PLACEHOLDERS}
            selectedValue={selectedSubject}
            validator={validateSubject}
          />
          {isSubjectError && (
            <div className="mb-2 w-full rounded border border-red-400 bg-red-100 p-2 text-red-700">
              <p className="text-sm">
                Error loading subjects: {subjectError?.message}
              </p>
              <Button
                className="mt-1 cursor-pointer"
                onClick={() => refetchSubject()}
                size="sm"
                variant="outline"
              >
                Retry
              </Button>
            </div>
          )}
          {isSubjectInfoError && (
            <div className="mb-2 w-full rounded border border-red-400 bg-red-100 p-2 text-red-700 ">
              <p className="text-sm">
                Error loading subject information: {subjectInfoError?.message}
              </p>
              <Button
                className="!bg-white !text-red-700 mt-1 cursor-pointer"
                onClick={() => refetchSubjectInfo()}
                size="sm"
                variant="outline"
              >
                Retry
              </Button>
            </div>
          )}
          <EnhancedSelect
            disabled={!selectedSubject}
            existingItems={subjectInfo?.topicData ?? []}
            isLoading={isSubjectInfoFetching && !!selectedSubject}
            labels={TOPIC_LABELS}
            onValueChange={setSelectedTopic}
            placeholders={TOPIC_PLACEHOLDERS}
            selectedValue={selectedTopic}
            validator={validateTopic}
          />
          <EnhancedSelect
            disabled={!selectedSubject}
            existingItems={
              subjectInfo?.paperTypeData?.map((item) => item.toString()) ?? []
            }
            inputType="number"
            isLoading={isSubjectInfoFetching && !!selectedSubject}
            labels={PAPER_TYPE_LABELS}
            onValueChange={setSelectedPaperType}
            placeholders={PAPER_TYPE_PLACEHOLDERS}
            selectedValue={selectedPaperType}
            validator={validatePaperType}
          />
          <EnhancedSelect
            disabled={!selectedSubject}
            existingItems={subjectInfo?.seasonData ?? []}
            isLoading={isSubjectInfoFetching && !!selectedSubject}
            labels={SEASON_LABELS}
            onValueChange={(item) => setSelectedSeason(item as ValidSeason)}
            placeholders={SEASON_PLACEHOLDERS}
            selectedValue={selectedSeason}
            validator={validateSeason}
          />
          <EnhancedSelect
            disabled={!selectedSubject}
            existingItems={
              subjectInfo?.yearData?.map((item) => item.toString()) ?? []
            }
            inputType="number"
            isLoading={isSubjectInfoFetching && !!selectedSubject}
            labels={YEAR_LABELS}
            onValueChange={setSelectedYear}
            placeholders={YEAR_PLACEHOLDERS}
            selectedValue={selectedYear}
            validator={validateYear}
          />
          <div className="flex w-full flex-col">
            <Label className="mb-2" htmlFor="questionNumber">
              Question Number
            </Label>
            <Input
              className={cn(
                "w-full",
                questionNumberError ? "border-red-500" : ""
              )}
              id="questionNumber"
              onChange={handleQuestionNumberChange}
              placeholder="Enter question number"
              type="number"
              value={questionNumber}
            />
            {questionNumberError && (
              <span className="mt-1 text-red-500 text-sm">
                {questionNumberError}
              </span>
            )}
          </div>
          <div className="flex w-full flex-col">
            <Label className="mb-2" htmlFor="paperVariant">
              Paper Variant
            </Label>
            <Input
              className={cn(
                "w-full",
                paperVariantError ? "border-red-500" : ""
              )}
              id="paperVariant"
              onChange={handlePaperVariantChange}
              placeholder="Enter paper variant"
              type="number"
              value={paperVariantInput}
            />
            {paperVariantError && (
              <span className="mt-1 text-red-500 text-sm">
                {paperVariantError}
              </span>
            )}
          </div>
          <div className="flex w-full flex-row items-center justify-start gap-2">
            <Label htmlFor="isMultipleChoice">Is Multiple Choice?</Label>
            <Switch
              checked={isMultipleChoice}
              className="cursor-pointer"
              id="isMultipleChoice"
              onCheckedChange={setIsMultipleChoice}
            />
          </div>
        </div>
        <div className="flex w-max flex-col items-center justify-center gap-4">
          <div className="flex w-full flex-wrap items-start justify-center gap-12">
            <div className="flex w-[370px] flex-col items-center justify-center gap-4">
              <h1 className="w-full text-center font-semibold text-xl">
                Question
              </h1>
              <ReorderableImageList
                images={questionImages}
                onRemoveImage={handleRemoveQuestionImage}
                onReorder={setQuestionImages}
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
            {isMultipleChoice ? (
              <div className="flex w-max flex-col items-center justify-center gap-4">
                <h1 className="w-full text-center font-semibold text-xl">
                  Answer
                </h1>
                <RadioGroup
                  defaultValue="A"
                  onValueChange={(value) => setMultipleChoiceInput(value)}
                  value={multipleChoiceInput}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="A" value="A" />
                    <Label htmlFor="A">A</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="B" value="B" />
                    <Label htmlFor="B">B</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="C" value="C" />
                    <Label htmlFor="C">C</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="D" value="D" />
                    <Label htmlFor="D">D</Label>
                  </div>
                </RadioGroup>
                <div className="flex w-full flex-col">
                  <Label className="mb-2" htmlFor="multipleChoiceInput">
                    Other
                  </Label>
                  <Input
                    id="multipleChoiceInput"
                    onChange={(e) => setMultipleChoiceInput(e.target.value)}
                    placeholder="Enter answer"
                    value={multipleChoiceInput}
                  />
                </div>
              </div>
            ) : (
              <div className="flex w-[370px] flex-col items-center justify-center gap-4">
                <h1 className="w-full text-center font-semibold text-xl">
                  Answer
                </h1>
                <ReorderableImageList
                  images={answerImages}
                  onRemoveImage={handleRemoveAnswerImage}
                  onReorder={setAnswerImages}
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
            )}
          </div>
          <div className="mt-4 flex w-full flex-row items-center justify-center gap-4">
            <AlertDialog
              onOpenChange={setIsUploadDialogOpen}
              open={isUploadDialogOpen}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex-1">
                    {canUpload ? (
                      <Button className="w-full cursor-pointer" disabled={true}>
                        Complete all fields
                      </Button>
                    ) : (
                      <Button
                        className="w-full cursor-pointer"
                        onClick={() => {
                          setCurrentTab("information");
                          setIsUploadDialogOpen(true);
                        }}
                      >
                        {isUploading ? "Uploading..." : "Upload"}
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
                  {!(answerImages.length || isMultipleChoice) && (
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
                  className="w-full"
                  defaultValue="information"
                  onValueChange={(value) => setCurrentTab(value as ValidTabs)}
                  value={currentTab}
                >
                  <TabsList>
                    <TabsTrigger
                      className="cursor-pointer"
                      disabled={isCurriculumRefetching}
                      value="information"
                    >
                      Information
                    </TabsTrigger>
                    <TabsTrigger
                      className="cursor-pointer"
                      disabled={isCurriculumRefetching}
                      value="image-preview"
                    >
                      Image Preview
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="information">
                    <div className="my-4 grid grid-cols-2 gap-2">
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
                        {(() => {
                          switch (selectedSeason) {
                            case "Summer":
                              return "M/J";
                            case "Winter":
                              return "O/N";
                            case "Spring":
                              return "F/M";
                            default:
                              return "";
                          }
                        })()}
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
                      Next <ArrowRight className="h-4 w-4" />
                    </Button>
                  </TabsContent>
                  <TabsContent value="image-preview">
                    <div className="mt-2 flex w-full flex-col items-start justify-center gap-2">
                      <h4 className="font-semibold">
                        Question (ordered by order)
                      </h4>
                      <ScrollArea
                        className={cn(
                          "w-full",
                          isMultipleChoice ? "h-[150px]" : "h-[100px]"
                        )}
                      >
                        <div className="flex w-full flex-col items-start justify-center gap-2 ">
                          {questionImages.map((image, index) => (
                            <div
                              className="flex w-full flex-row items-center justify-center gap-2"
                              key={image.name + image.type}
                            >
                              <p>{index + 1}.</p>
                              <Button
                                className="flex-1 cursor-pointer"
                                onClick={() => {
                                  setImageDialogOpen(true);
                                  setImageDialogImage(
                                    URL.createObjectURL(image)
                                  );
                                }}
                                variant="outline"
                              >
                                {image.name}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      <h4 className="mt-6 font-semibold">
                        Answer {isMultipleChoice ? "" : "(ordered by order)"}
                      </h4>
                      {isMultipleChoice ? (
                        <div className="w-full">
                          <p>Answer: {multipleChoiceInput}</p>
                        </div>
                      ) : (
                        <ScrollArea className="h-[100px] w-full">
                          <div className="flex w-full flex-col items-start justify-center gap-2">
                            {answerImages.map((image, index) => (
                              <div
                                className="flex w-full flex-row items-center justify-center gap-2"
                                key={image.name + image.type}
                              >
                                <p>{index + 1}.</p>
                                <Button
                                  className="flex-1 cursor-pointer"
                                  onClick={() => {
                                    setImageDialogOpen(true);
                                    setImageDialogImage(
                                      URL.createObjectURL(image)
                                    );
                                  }}
                                  variant="outline"
                                >
                                  {image.name}
                                </Button>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </div>
                    <div className="mt-5 flex flex-row items-center justify-center gap-4">
                      <Button
                        className="flex-1 cursor-pointer"
                        onClick={() => setCurrentTab("information")}
                      >
                        <ArrowLeft className="h-4 w-4" />
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
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </>
                        ) : (
                          <>
                            Upload <Upload className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="refetching">
                    <div className="mt-2 flex w-full flex-col items-center justify-center gap-2">
                      <h4 className="font-semibold">Refetching...</h4>
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </TabsContent>
                </Tabs>

                <AlertDialogFooter className="flex flex-row items-center justify-center gap-4">
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
              onOpenChange={setIsResetDialogOpen}
              open={isResetDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Button
                  className="flex-1 cursor-pointer"
                  disabled={isCurriculumFetching}
                  variant="outline"
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
                <AlertDialogFooter className="flex flex-row items-center justify-center gap-4">
                  <AlertDialogCancel
                    className="flex-1 cursor-pointer"
                    disabled={isCurriculumRefetching}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <Button
                    className="flex-1 cursor-pointer"
                    disabled={isCurriculumRefetching}
                    onClick={resetAllInputs}
                  >
                    {isCurriculumRefetching ? (
                      <>
                        Resetting...
                        <Loader2 className="h-4 w-4 animate-spin" />
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
