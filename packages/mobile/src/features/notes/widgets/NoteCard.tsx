import React from 'react';
import { Pressable, Text } from 'react-native';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@acme/design-system-mobile';

interface NoteCardProps {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  onPress: (id: string) => void;
}

export function NoteCard({ id, title, content, updatedAt, onPress }: NoteCardProps) {
  return (
    <Pressable testID={`notes-card-${id}`} onPress={() => onPress(id)}>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Text className="text-sm text-gray-500" numberOfLines={3}>{content}</Text>
        </CardContent>
        <CardFooter>
          <Text className="text-xs text-gray-400">
            {new Date(updatedAt).toLocaleDateString()}
          </Text>
        </CardFooter>
      </Card>
    </Pressable>
  );
}
