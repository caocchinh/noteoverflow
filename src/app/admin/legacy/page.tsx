'use client';
import { AlertDialog } from '@radix-ui/react-alert-dialog';
import { ChevronDown, File, FolderUp, RefreshCw, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialogContent,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  BAD_REQUEST,
  FAILED_TO_UPLOAD_IMAGE,
  FILE_SIZE_EXCEEDS_LIMIT,
  INTERNAL_SERVER_ERROR,
  ONLY_WEBP_FILES_ALLOWED,
} from '@/constants/constants';
import type {
  ValidContentType,
  ValidCurriculum,
  ValidSeason,
} from '@/constants/types';
import { uploadImage } from '@/features/admin/content/lib/utils';
import { legacyUploadAction } from '@/features/admin/legacy/server/actions';
import { parseQuestionId } from '@/lib/utils';

// Add type declaration for directory input
declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    directory?: string;
    webkitdirectory?: string;
  }
}

const LegacyUploadPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [failedUploads, setFailedUploads] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [curriculum, setCurriculum] = useState<ValidCurriculum>('CIE A-LEVEL');
  const [subjectCode, setSubjectCode] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setFiles(fileArray);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files) {
      const fileArray = Array.from(e.dataTransfer.files);
      setFiles(fileArray);
    }
  };

  const uploadFile = async (file: File): Promise<boolean> => {
    const subjectFullName = file.webkitRelativePath.split('/')[0];
    const questionNumber = file.webkitRelativePath.split('/')[7].split('_')[0];
    const order = file.webkitRelativePath
      .split('/')[7]
      .split('_')[1]
      .split('.')[0];
    const contentType: ValidContentType = file.webkitRelativePath.split(
      '/'
    )[1] as ValidContentType;

    const topic = file.webkitRelativePath.split('/')[2].toUpperCase();
    const season: ValidSeason = file.webkitRelativePath.split(
      '/'
    )[4] as ValidSeason;
    const tempCode = file.webkitRelativePath.split('/')[6];
    const seasonPart = tempCode.split('_')[2];
    const result = `${seasonPart.slice(0, 1)}_${seasonPart.slice(1)}`;
    const paperCode = tempCode.replace(seasonPart, result);

    const paperVariant = Number.parseInt(paperCode.split('_')[1], 10) % 10;
    const paperType = Math.floor(
      Number.parseInt(paperCode.split('_')[1], 10) / 10
    );
    const year = file.webkitRelativePath.split('/')[3];

    let imageSrc = '';

    if (file.type.includes('text')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        imageSrc = content;
      };
      reader.readAsText(file);
    } else {
      const { success, data, error } = await uploadImage({
        file,
        subjectFullName,
        paperCode,
        curriculumName: curriculum,
        contentType,
        questionNumber,
        order: Number.parseInt(order, 10),
      });
      if (!success) {
        if (error === INTERNAL_SERVER_ERROR) {
          toast.error(INTERNAL_SERVER_ERROR);
        } else if (error === BAD_REQUEST) {
          toast.error(BAD_REQUEST);
        } else if (error === FILE_SIZE_EXCEEDS_LIMIT) {
          toast.error(FILE_SIZE_EXCEEDS_LIMIT);
        } else if (error === ONLY_WEBP_FILES_ALLOWED) {
          toast.error(ONLY_WEBP_FILES_ALLOWED);
        } else {
          toast.error(FAILED_TO_UPLOAD_IMAGE);
        }
        return false;
      }
      imageSrc = data?.imageSrc ?? '';
    }

    const questionId = parseQuestionId({
      subject: subjectFullName,
      paperCode,
      curriculumName: curriculum,
      questionNumber: questionNumber.slice(1),
    });

    const { success: success2, error: error2 } = await legacyUploadAction({
      curriculum,
      subjectFullName,
      year: Number.parseInt(year, 10),
      season,
      paperType,
      paperVariant,
      topic,
      questionId,
      questionNumber: Number.parseInt(questionNumber[1], 10),
      contentType,
      imageSrc,
      order: Number.parseInt(order, 10),
    });

    if (!success2) {
      if (error2 === INTERNAL_SERVER_ERROR) {
        toast.error(INTERNAL_SERVER_ERROR);
      } else if (error2 === BAD_REQUEST) {
        toast.error(BAD_REQUEST);
      } else {
        toast.error(FAILED_TO_UPLOAD_IMAGE);
      }
      return false;
    }

    return true;
  };

  const handleUpload = async () => {
    if (isUploading || files.length === 0) {
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setFailedUploads([]);

    const newFailedUploads: File[] = [];
    let completedUploads = 0;
    setSubjectCode(files[0].webkitRelativePath.split('/')[0]);

    // Sort files so that "questions" come before "answers"
    const sortedFiles = [...files].sort((a, b) => {
      const aType = a.webkitRelativePath.split('/')[1];
      const bType = b.webkitRelativePath.split('/')[1];

      if (aType === 'questions' && bType === 'answers') {
        return -1;
      }
      if (aType === 'answers' && bType === 'questions') {
        return 1;
      }
      return 0;
    });

    for (const file of sortedFiles) {
      try {
        // biome-ignore lint/nursery/noAwaitInLoop: <Needed for uploading files>
        const success = await uploadFile(file);
        if (!success) {
          newFailedUploads.push(file);
        }
      } catch {
        newFailedUploads.push(file);
      }
      completedUploads++;
      const progress = Math.round((completedUploads / files.length) * 100);
      setUploadProgress(progress);
    }

    setIsUploading(false);
    setFailedUploads(newFailedUploads);

    if (newFailedUploads.length === 0) {
      toast.success('All files uploaded successfully');
    } else {
      toast.error(`${newFailedUploads.length} file(s) failed to upload`, {
        description: 'Check the failed uploads section to retry',
      });
    }
    setFiles([]);
  };

  const handleRetryFailed = async () => {
    if (failedUploads.length === 0) {
      return;
    }

    // Add failed uploads back to files list if they aren't already there
    const currentFilePaths = new Set(
      files.map((file) => file.webkitRelativePath)
    );
    const filesToAdd = failedUploads.filter(
      (file) => !currentFilePaths.has(file.webkitRelativePath)
    );

    if (filesToAdd.length > 0) {
      setFiles([...files, ...filesToAdd]);
    }

    // Reset failed uploads list
    setFailedUploads([]);

    // Start upload process
    await handleUpload();
  };

  // Add useEffect to prevent navigation during upload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isUploading) {
        e.preventDefault();
      }
    };

    if (isUploading) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isUploading]);

  return (
    <div className="min-h-screen w-full bg-background p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 font-bold text-3xl text-foreground">
          Legacy Upload
        </h1>

        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-foreground text-lg">Settings</h3>
        </div>
        <div className="mb-5 flex items-center gap-4">
          <div className="flex flex-col gap-1">
            <label
              className="font-medium text-foreground-muted text-sm"
              htmlFor="curriculum"
            >
              Curriculum
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="w-36" id="curriculum" variant="outline">
                  {curriculum} <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setCurriculum('CIE A-LEVEL')}>
                  CIE A-LEVEL
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurriculum('CIE IGCSE')}>
                  CIE IGCSE
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div
          className={`mb-8 flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all ${
            isDragging
              ? 'border-primary bg-primary/10'
              : 'border-border bg-card hover:border-primary'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{ minHeight: '200px' }}
        >
          <div className="flex flex-col items-center text-center">
            <FolderUp
              className={`mb-4 h-16 w-16 ${
                isDragging ? 'text-primary' : 'text-muted-foreground'
              }`}
            />
            <p className="mb-2 font-medium text-foreground text-lg">
              Drag & drop your directory here
            </p>
            <p className="mb-4 text-gray-500 text-sm">
              Or select files using the button below
            </p>

            <label className="relative cursor-pointer">
              <Button>
                <Upload className="mr-2" size={18} />
                Select Directory
              </Button>
              <input
                accept="image/png"
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                directory=""
                onChange={handleFileChange}
                type="file"
                webkitdirectory=""
              />
            </label>
          </div>
        </div>

        <AlertDialog open={isUploading}>
          <AlertDialogContent>
            <AlertDialogTitle>Upload Progress</AlertDialogTitle>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-2">
                <p className="font-medium text-sm">Subject: {subjectCode}</p>
                <p className="font-medium text-sm">Curriculum: {curriculum}</p>
              </div>
              <div className="w-full rounded-full bg-muted">
                <div
                  className="h-2.5 rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="font-medium text-sm">{uploadProgress}%</span>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        {files.length > 0 && (
          <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-md">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-1">
                <h3 className="mr-4 font-semibold text-foreground text-xl">
                  Selected Files
                </h3>
                <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-sm">
                  {files.length} files
                </span>
              </div>

              <Button
                className="cursor-pointer"
                disabled={isUploading}
                onClick={handleUpload}
                variant="outline"
              >
                <Upload className="mr-2" size={16} />
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>

            <div className="max-h-96 overflow-auto">
              <ul className="divide-y divide-gray-100">
                {files.map((file, index) => (
                  <li
                    className="rounded px-2 py-3 transition-colors hover:bg-muted"
                    key={index}
                  >
                    <div className="flex items-center">
                      <div className="mr-3 flex-shrink-0">
                        <File className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground text-sm">
                          {file.name}
                        </p>
                        <p className="mt-1 truncate text-muted-foreground text-xs">
                          {file.webkitRelativePath || 'No path available'}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {failedUploads.length > 0 && (
          <div className="mb-6 rounded-xl border border-red-100 bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <h3 className="mr-4 font-semibold text-red-800 text-xl">
                  Failed Uploads
                </h3>
                <span className="rounded-full bg-red-100 px-3 py-1 font-medium text-red-800 text-sm">
                  {failedUploads.length} files
                </span>
              </div>

              <Button
                className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-500 dark:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-500"
                onClick={handleRetryFailed}
                variant="outline"
              >
                <RefreshCw className="mr-2" size={16} />
                Retry All
              </Button>
            </div>

            <div className="max-h-64 overflow-auto">
              <ul className="divide-y divide-red-100">
                {failedUploads.map((file, index) => (
                  <li
                    className="rounded px-2 py-3 transition-colors hover:bg-red-50"
                    key={index}
                  >
                    <div className="flex items-center">
                      <div className="mr-3 flex-shrink-0">
                        <File className="h-6 w-6 text-red-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-red-800 text-sm">
                          {file.name}
                        </p>
                        <p className="mt-1 truncate text-red-500 text-xs">
                          {file.webkitRelativePath || 'No path available'}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LegacyUploadPage;
