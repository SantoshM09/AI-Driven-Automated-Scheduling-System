import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadFormProps {
  onJsonLoad: (content: string) => void;
}

export default function UploadForm({ onJsonLoad }: UploadFormProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    if (!file.name.endsWith('.json')) {
      toast({
        title: "Invalid File Type",
        description: "Please select a JSON file.",
        variant: "destructive",
      });
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onJsonLoad(content);
      toast({
        title: "File Loaded",
        description: `Successfully loaded ${file.name}`,
      });
    };
    
    reader.onerror = () => {
      toast({
        title: "File Read Error",
        description: "Failed to read the selected file.",
        variant: "destructive",
      });
    };
    
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="h-5 w-5 mr-2" />
          File Upload
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <Label htmlFor="json-file">Upload JSON File</Label>
          <div
            className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              id="json-file"
              onChange={handleFileInputChange}
            />
            
            <div className="flex flex-col items-center">
              {fileName ? (
                <>
                  <FileText className="h-8 w-8 text-green-600 mb-2" />
                  <p className="text-green-700 font-medium">{fileName}</p>
                  <p className="text-sm text-green-600">File loaded successfully</p>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-slate-400 mb-2" />
                  <p className="text-slate-600">Click to upload or drag and drop</p>
                  <p className="text-sm text-slate-500">JSON files only</p>
                </>
              )}
            </div>
          </div>
          
          {fileName && (
            <Button
              onClick={() => {
                setFileName("");
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Clear File
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
