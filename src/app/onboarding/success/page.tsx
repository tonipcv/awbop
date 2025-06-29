import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Form submitted successfully!</CardTitle>
            <CardDescription>
              Thank you for filling out the form. The doctor will contact you soon.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
} 