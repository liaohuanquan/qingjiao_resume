import type { ElementType } from "react";
import { Phone, Mail, MapPin, UserCheck, Briefcase, Code, Globe, School, User, Award, Target, Link, Calendar, MessageCircle } from "lucide-react";
export const ICON_MAP: Record<string, ElementType> = {
  phone: Phone,
  email: Mail,
  city: MapPin,
  birthday: UserCheck,
  experience: Briefcase,
  hometown: MapPin,
  politics: UserCheck,
  github: Code,
  blog: Globe,
  school: School,
  custom: User,
  award: Award,
  target: Target,
  link: Link,
  calendar: Calendar,
  message: MessageCircle,
};
