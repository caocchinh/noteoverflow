"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurriculum } from "@/server/main/curriculum";
import { getSubjectByCurriculum } from "@/server/main/subject";
import { useMemo, useState } from "react";
import {
  CurriculumType,
  SubjectType,
} from "@/features/admin/content/constants/types";
import EnhancedSelect from "@/features/admin/content/components/EnhancedSelect";
import { getPaperType } from "@/server/main/paperType";
import { getSeason } from "@/server/main/season";
import { getYear } from "@/server/main/year";
import { getTopic } from "@/server/main/topic";
import {
  validatePaperType,
  validateSeason,
  validateYear,
  validateQuestionNumber,
  validateSubject,
  validatePaperVariant,
  paperCodeParser,
  seasonToCode,
} from "@/features/admin/content/lib/utils";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import FileDrop from "@/features/admin/content/components/FileDrop";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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

const UploadPage = () => {
  const [selectedCurriculum, setSelectedCurriculum] = useState<
    string | undefined
  >(undefined);
  const [isCurriculumSelectOpen, setIsCurriculumSelectOpen] =
    useState<boolean>(false);
  const [newCurriculum, setNewCurriculum] = useState<string[]>([]);
  const [newCurriculumInput, setNewCurriculumInput] = useState<string>("");

  const [selectedSubject, setSelectedSubject] = useState<string | undefined>(
    undefined
  );
  const [isSubjectSelectOpen, setIsSubjectSelectOpen] =
    useState<boolean>(false);
  const [newSubject, setNewSubject] = useState<string[]>([]);
  const [newSubjectInput, setNewSubjectInput] = useState<string>("");

  const [selectedTopic, setSelectedTopic] = useState<string | undefined>(
    undefined
  );
  const [isTopicSelectOpen, setIsTopicSelectOpen] = useState<boolean>(false);
  const [newTopic, setNewTopic] = useState<string[]>([]);
  const [newTopicInput, setNewTopicInput] = useState<string>("");

  const [selectedPaperType, setSelectedPaperType] = useState<
    string | undefined
  >(undefined);
  const [isPaperTypeSelectOpen, setIsPaperTypeSelectOpen] =
    useState<boolean>(false);
  const [newPaperType, setNewPaperType] = useState<string[]>([]);
  const [newPaperTypeInput, setNewPaperTypeInput] = useState<string>("");

  const [selectedSeason, setSelectedSeason] = useState<
    "Summer" | "Winter" | "Spring" | ""
  >("");
  const [isSeasonSelectOpen, setIsSeasonSelectOpen] = useState<boolean>(false);
  const [newSeason, setNewSeason] = useState<string[]>([]);
  const [newSeasonInput, setNewSeasonInput] = useState<string>("");

  const [selectedYear, setSelectedYear] = useState<string | undefined>(
    undefined
  );
  const queryClient = useQueryClient();

  const [isYearSelectOpen, setIsYearSelectOpen] = useState<boolean>(false);
  const [newYear, setNewYear] = useState<string[]>([]);
  const [newYearInput, setNewYearInput] = useState<string>("");
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
  const [currentTab, setCurrentTab] = useState<"information" | "image-preview">(
    "information"
  );
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
  } = useQuery({
    queryKey: ["curriculum"],
    queryFn: async (): Promise<CurriculumType[]> => {
      const data = await getCurriculum();
      return data;
    },
    select: (data) => {
      if (data.length > 0 && !selectedCurriculum) {
        setSelectedCurriculum(data[0].name);
      }
      return data;
    },
  });

  const { data: subject } = useQuery({
    queryKey: ["subject", selectedCurriculum],
    queryFn: async (): Promise<SubjectType[]> => {
      return await getSubjectByCurriculum(selectedCurriculum ?? "");
    },
    enabled: !!selectedCurriculum,
  });

  const { data: subjectInfo, isFetching: isSubjectInfoFetching } = useQuery({
    queryKey: ["subjectInfo", selectedSubject],
    queryFn: async () => {
      const [topicData, paperTypeData, seasonData, yearData] =
        await Promise.all([
          getTopic(selectedSubject ?? ""),
          getPaperType(selectedSubject ?? ""),
          getSeason(selectedSubject ?? ""),
          getYear(selectedSubject ?? ""),
        ]);
      return { topicData, paperTypeData, seasonData, yearData };
    },
    enabled: !!selectedSubject,
  });

  const handleAddNewCurriculum = (item: string) => {
    setNewCurriculum([...newCurriculum, item]);
    setNewCurriculumInput("");
  };

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

  const handleRemoveNewCurriculum = (index: number) => {
    setNewCurriculum(newCurriculum.filter((_, i) => i !== index));
    if (selectedCurriculum === newCurriculum[index]) {
      setSelectedCurriculum("");
    }
  };

  const handleAddNewSubject = (item: string) => {
    setNewSubject([...newSubject, item]);
    setNewSubjectInput("");
  };

  const handleRemoveNewSubject = (index: number) => {
    setNewSubject(newSubject.filter((_, i) => i !== index));
    if (selectedSubject === newSubject[index]) {
      setSelectedSubject("");
    }
  };

  const handleAddNewTopic = (item: string) => {
    setNewTopic([...newTopic, item]);
    setNewTopicInput("");
  };

  const handleRemoveNewTopic = (index: number) => {
    setNewTopic(newTopic.filter((_, i) => i !== index));
    if (selectedTopic === newTopic[index]) {
      setSelectedTopic("");
    }
  };

  const handleAddNewPaperType = (item: string) => {
    setNewPaperType([...newPaperType, item]);
    setNewPaperTypeInput("");
  };

  const handleRemoveNewPaperType = (index: number) => {
    setNewPaperType(newPaperType.filter((_, i) => i !== index));
    if (selectedPaperType === newPaperType[index]) {
      setSelectedPaperType("");
    }
  };

  const handleAddNewSeason = (item: string) => {
    setNewSeason([...newSeason, item]);
    setNewSeasonInput("");
  };

  const handleRemoveNewSeason = (index: number) => {
    setNewSeason(newSeason.filter((_, i) => i !== index));
    if (selectedSeason === newSeason[index]) {
      setSelectedSeason("");
    }
  };

  const handleAddNewYear = (item: string) => {
    setNewYear([...newYear, item]);
    setNewYearInput("");
  };

  const handleRemoveNewYear = (index: number) => {
    setNewYear(newYear.filter((_, i) => i !== index));
    if (selectedYear === newYear[index]) {
      setSelectedYear("");
    }
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
        toast.error("Only .webp files are allowed");
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

  const handleUpload = () => {
    setCurrentTab("information");
    console.log(
      paperCodeParser({
        subjectCode: selectedSubject!.split("(")[1],
        paperType: selectedPaperType!,
        variant: paperVariantInput!,
        season: selectedSeason as "Summer" | "Winter" | "Spring",
        year: selectedYear!,
      })
    );
    // setIsUploading(true);
  };

  return (
    <>
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
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
          <EnhancedSelect
            selectedValue={selectedCurriculum}
            onValueChange={handleCurriculumChange}
            isOpen={isCurriculumSelectOpen}
            onOpenChange={setIsCurriculumSelectOpen}
            existingItems={curriculumData?.map((item) => item.name) ?? []}
            newItems={newCurriculum}
            onAddNewItem={handleAddNewCurriculum}
            onRemoveNewItem={handleRemoveNewCurriculum}
            placeholder="Select a curriculum"
            loadingPlaceholder="Fetching existing curriculums..."
            isLoading={isCurriculumFetching || isCurriculumRefetching}
            newItemInputValue={newCurriculumInput}
            onNewItemInputChange={setNewCurriculumInput}
            existingItemsLabel="Existing Curriculum"
            newItemsLabel="New Curriculum"
            inputPlaceholder="Enter new curriculum name"
            className="w-full"
            label="Curriculum"
          />

          <EnhancedSelect
            selectedValue={selectedSubject}
            onValueChange={handleSubjectChange}
            isOpen={isSubjectSelectOpen}
            onOpenChange={setIsSubjectSelectOpen}
            existingItems={subject?.map((item) => item.id) ?? []}
            newItems={newSubject}
            onAddNewItem={handleAddNewSubject}
            onRemoveNewItem={handleRemoveNewSubject}
            placeholder={
              !selectedCurriculum
                ? "Select a curriculum first"
                : "Select a subject"
            }
            newItemInputValue={newSubjectInput}
            onNewItemInputChange={setNewSubjectInput}
            existingItemsLabel="Existing Subjects"
            newItemsLabel="New Subjects"
            inputPlaceholder="Enter new subject name"
            className="w-full"
            disabled={
              !selectedCurriculum ||
              isCurriculumRefetching ||
              isCurriculumFetching
            }
            label="Subject"
            validator={validateSubject}
          />

          <EnhancedSelect
            selectedValue={selectedTopic}
            onValueChange={setSelectedTopic}
            isOpen={isTopicSelectOpen}
            onOpenChange={setIsTopicSelectOpen}
            existingItems={subjectInfo?.topicData ?? []}
            newItems={newTopic}
            onAddNewItem={handleAddNewTopic}
            onRemoveNewItem={handleRemoveNewTopic}
            placeholder={
              !subjectInfo ? "Select a subject first" : "Select a topic"
            }
            loadingPlaceholder="Fetching existing topics..."
            isLoading={isSubjectInfoFetching && !!selectedSubject}
            newItemInputValue={newTopicInput}
            onNewItemInputChange={setNewTopicInput}
            existingItemsLabel="Existing Topics"
            newItemsLabel="New Topics"
            inputPlaceholder="Enter new topic name"
            className="w-full"
            disabled={!selectedSubject}
            label="Topic"
          />

          <EnhancedSelect
            selectedValue={selectedPaperType}
            onValueChange={setSelectedPaperType}
            isOpen={isPaperTypeSelectOpen}
            onOpenChange={setIsPaperTypeSelectOpen}
            existingItems={
              subjectInfo?.paperTypeData?.map((item) => item.toString()) ?? []
            }
            newItems={newPaperType}
            onAddNewItem={handleAddNewPaperType}
            onRemoveNewItem={handleRemoveNewPaperType}
            placeholder={
              !subjectInfo ? "Select a subject first" : "Select a paper type"
            }
            loadingPlaceholder="Fetching existing paper types..."
            isLoading={isSubjectInfoFetching && !!selectedSubject}
            newItemInputValue={newPaperTypeInput}
            onNewItemInputChange={setNewPaperTypeInput}
            existingItemsLabel="Existing Paper Types"
            newItemsLabel="New Paper Types"
            inputPlaceholder="Enter new paper type"
            className="w-full"
            disabled={!selectedSubject}
            validator={validatePaperType}
            label="Paper Type"
          />

          <EnhancedSelect
            selectedValue={selectedSeason}
            onValueChange={(item) =>
              setSelectedSeason(item as "Summer" | "Winter" | "Spring")
            }
            isOpen={isSeasonSelectOpen}
            onOpenChange={setIsSeasonSelectOpen}
            existingItems={subjectInfo?.seasonData ?? []}
            newItems={newSeason}
            onAddNewItem={handleAddNewSeason}
            onRemoveNewItem={handleRemoveNewSeason}
            placeholder={
              !subjectInfo ? "Select a subject first" : "Select a season"
            }
            loadingPlaceholder="Fetching existing seasons..."
            isLoading={isSubjectInfoFetching && !!selectedSubject}
            newItemInputValue={newSeasonInput}
            onNewItemInputChange={setNewSeasonInput}
            existingItemsLabel="Existing Seasons"
            newItemsLabel="New Seasons"
            inputPlaceholder="Enter new season"
            className="w-full"
            disabled={!selectedSubject}
            validator={validateSeason}
            label="Season"
          />

          <EnhancedSelect
            selectedValue={selectedYear}
            onValueChange={setSelectedYear}
            isOpen={isYearSelectOpen}
            onOpenChange={setIsYearSelectOpen}
            existingItems={
              subjectInfo?.yearData?.map((item) => item.toString()) ?? []
            }
            newItems={newYear}
            onAddNewItem={handleAddNewYear}
            onRemoveNewItem={handleRemoveNewYear}
            placeholder={
              !subjectInfo ? "Select a subject first" : "Select a year"
            }
            loadingPlaceholder="Fetching existing years..."
            isLoading={isSubjectInfoFetching && !!selectedSubject}
            newItemInputValue={newYearInput}
            onNewItemInputChange={setNewYearInput}
            existingItemsLabel="Existing Years"
            newItemsLabel="New Years"
            inputPlaceholder="Enter new year"
            className="w-full"
            disabled={!selectedSubject}
            validator={validateYear}
            label="Year"
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
              <AlertDialogTrigger asChild>
                <Button
                  className="flex-1 cursor-pointer"
                  disabled={canUpload}
                  onClick={handleUpload}
                >
                  {isUploading
                    ? "Uploading..."
                    : !canUpload
                    ? "Upload"
                    : "Complete required fields"}
                </Button>
              </AlertDialogTrigger>
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
                  onValueChange={(value) =>
                    setCurrentTab(value as "information" | "image-preview")
                  }
                >
                  <TabsList>
                    <TabsTrigger value="information" className="cursor-pointer">
                      Information
                    </TabsTrigger>
                    <TabsTrigger
                      value="image-preview"
                      className="cursor-pointer"
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
                      >
                        Upload <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>

                <AlertDialogFooter className="flex flex-row gap-4 items-center justify-center">
                  <AlertDialogCancel className="flex-1 cursor-pointer">
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
