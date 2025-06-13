import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Upload, Check, AlertCircle, Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import UploadForm from "@/components/upload-form";

export default function UploadPage() {
  const [jsonContent, setJsonContent] = useState("");
  const [validationStatus, setValidationStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [validationError, setValidationError] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/scheduler/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Upload Successful",
        description: "Schedule data has been processed and stored successfully.",
      });
      // Invalidate all cached data to refresh the app
      queryClient.invalidateQueries();
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const validateJSON = () => {
    if (!jsonContent.trim()) {
      setValidationStatus("invalid");
      setValidationError("JSON content is empty");
      return;
    }

    try {
      const parsed = JSON.parse(jsonContent);
      
      // Basic validation
      const requiredFields = ["college_time", "break_", "rooms", "subjects"];
      const missingFields = requiredFields.filter(field => !parsed[field]);
      
      if (missingFields.length > 0) {
        setValidationStatus("invalid");
        setValidationError(`Missing required fields: ${missingFields.join(", ")}`);
        return;
      }

      // Validate college_time
      if (!parsed.college_time.startTime || !parsed.college_time.endTime) {
        setValidationStatus("invalid");
        setValidationError("college_time must have startTime and endTime");
        return;
      }

      // Validate subjects
      if (!Array.isArray(parsed.subjects) || parsed.subjects.length === 0) {
        setValidationStatus("invalid");
        setValidationError("subjects must be a non-empty array");
        return;
      }

      setValidationStatus("valid");
      setValidationError("");
      
      toast({
        title: "Validation Successful",
        description: "JSON structure is valid and ready for upload.",
      });
    } catch (error) {
      setValidationStatus("invalid");
      setValidationError(error instanceof Error ? error.message : "Invalid JSON format");
    }
  };

  const handleUpload = () => {
    if (validationStatus !== "valid") {
      toast({
        title: "Validation Required",
        description: "Please validate the JSON before uploading.",
        variant: "destructive",
      });
      return;
    }

    try {
      const data = JSON.parse(jsonContent);
      uploadMutation.mutate(data);
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Failed to parse JSON content.",
        variant: "destructive",
      });
    }
  };

  const loadSampleJSON = () => {
    const sampleJSON = {
      "college_time": {
        "startTime": "09:30",
        "endTime": "16:30"
      },
      "break_": [
        {
          "day": "ALL_DAYS",
          "startTime": "13:00",
          "endTime": "14:00"
        }
      ],
      "rooms": ["R1", "R2", "R3", "R4"],
      "subjects": [
        {
          "name": "Discrete Mathematics",
          "duration": 50,
          "no_of_classes_per_week": 4,
          "faculty": [
            {
              "id": "F1",
              "name": "Dr. Anil Sharma",
              "availability": [
                { "day": "MONDAY", "startTime": "09:30", "endTime": "13:00" },
                { "day": "TUESDAY", "startTime": "09:30", "endTime": "13:00" },
                { "day": "FRIDAY", "startTime": "09:30", "endTime": "13:00" }
              ]
            }
          ]
        },
        {
          "name": "Computer Networks",
          "duration": 50,
          "no_of_classes_per_week": 3,
          "faculty": [
            {
              "id": "F2",
              "name": "Prof. Rita Singh",
              "availability": [
                { "day": "MONDAY", "startTime": "10:20", "endTime": "14:00" },
                { "day": "TUESDAY", "startTime": "10:20", "endTime": "14:00" },
                { "day": "WEDNESDAY", "startTime": "09:30", "endTime": "13:00" }
              ]
            }
          ]
        },
        {
          "name": "Database Systems",
          "duration": 50,
          "no_of_classes_per_week": 3,
          "faculty": [
            {
              "id": "F3",
              "name": "Dr. Kumar Patel",
              "availability": [
                { "day": "THURSDAY", "startTime": "09:30", "endTime": "13:00" },
                { "day": "FRIDAY", "startTime": "10:20", "endTime": "14:00" },
                { "day": "SATURDAY", "startTime": "09:30", "endTime": "13:00" }
              ]
            }
          ]
        }
      ]
    };

    setJsonContent(JSON.stringify(sampleJSON, null, 2));
    setValidationStatus("idle");
    setValidationError("");
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Upload Schedule Data</h2>
        <p className="text-slate-600">Import schedule configuration in JSON format</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Form */}
        <div className="space-y-6">
          <UploadForm onJsonLoad={setJsonContent} />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                JSON Editor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="json-content">Paste JSON directly</Label>
                <Textarea
                  id="json-content"
                  value={jsonContent}
                  onChange={(e) => {
                    setJsonContent(e.target.value);
                    setValidationStatus("idle");
                    setValidationError("");
                  }}
                  placeholder='{\n  "college_time": {\n    "startTime": "09:30",\n    "endTime": "16:30"\n  },\n  ...\n}'
                  className="font-mono text-sm min-h-[300px]"
                />
              </div>

              {validationStatus === "valid" && (
                <Alert>
                  <Check className="h-4 w-4" />
                  <AlertDescription>
                    JSON is valid and ready for upload.
                  </AlertDescription>
                </Alert>
              )}

              {validationStatus === "invalid" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {validationError}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending || validationStatus !== "valid"}
                  className="flex items-center"
                >
                  {uploadMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Upload Schedule
                </Button>
                <Button onClick={validateJSON} variant="outline">
                  <Check className="h-4 w-4 mr-2" />
                  Validate JSON
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* JSON Structure Guide */}
        <Card>
          <CardHeader>
            <CardTitle>JSON Structure Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-medium text-slate-700 mb-2">Required Fields</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li><Badge variant="outline">college_time</Badge> - Start and end times</li>
                  <li><Badge variant="outline">break_</Badge> - Break periods</li>
                  <li><Badge variant="outline">rooms</Badge> - Available rooms</li>
                  <li><Badge variant="outline">subjects</Badge> - Subject details</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-700 mb-2">Subject Structure</h4>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li><Badge variant="outline">name</Badge> - Subject name</li>
                  <li><Badge variant="outline">duration</Badge> - Class duration in minutes</li>
                  <li><Badge variant="outline">no_of_classes_per_week</Badge> - Weekly frequency</li>
                  <li><Badge variant="outline">faculty</Badge> - Faculty assignment and availability</li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-green-700 mb-2">Faculty Structure</h4>
                <ul className="text-sm text-green-600 space-y-1">
                  <li><Badge variant="outline">id</Badge> - Unique faculty ID</li>
                  <li><Badge variant="outline">name</Badge> - Faculty name</li>
                  <li><Badge variant="outline">availability</Badge> - Available time slots</li>
                </ul>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-slate-700 mb-2">Sample JSON</h4>
              <Button onClick={loadSampleJSON} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Load Sample JSON
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Status */}
      {uploadMutation.isSuccess && (
        <Card className="mt-6 border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <h4 className="font-medium text-green-800">Upload Successful</h4>
                <p className="text-green-600 text-sm">Schedule data has been processed and stored successfully.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
