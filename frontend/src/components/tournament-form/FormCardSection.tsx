import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface FormSectionCardProps {
  icon?: React.ReactNode;
  title: React.ReactNode;
  children: React.ReactNode;
}

export const FormSectionCard = ({
  icon,
  title,
  children,
}: FormSectionCardProps) => (
  <Card className="gap-2 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-gray-800">
        {icon}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">{children}</CardContent>
  </Card>
);
