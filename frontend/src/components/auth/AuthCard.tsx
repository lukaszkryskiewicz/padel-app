import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { AuthCardProps } from '@/types/auth';
import { Trophy } from 'lucide-react';

export const AuthCard = ({ title, description, children }: AuthCardProps) => (
  <div className="w-full max-w-md">
    <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-sm">
      <CardHeader className="text-center pb-6">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg">
            <Trophy className="w-8 h-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          {title}
        </CardTitle>
        <CardDescription className="text-gray-600">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  </div>
);
