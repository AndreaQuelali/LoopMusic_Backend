export class CreateMixDto {
  name!: string;
  description?: string;
  isPublic?: boolean;
  songIds!: string[];
}
