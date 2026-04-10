import React from 'react';
import { Pressable, View, Text } from 'react-native';
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
    <Pressable
      testID={`notes-card-${id}`}
      onPress={() => onPress(id)}
    >
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Text
            className="text-sm text-ink-muted"
            numberOfLines={2}
            style={{ fontFamily: 'Karla_400Regular' }}
          >
            {content}
          </Text>
        </CardContent>
        <CardFooter className="justify-between">
          <Text
            className="text-xs text-ink-light"
            style={{ fontFamily: 'Karla_400Regular' }}
          >
            {new Date(updatedAt).toLocaleDateString()}
          </Text>
          <Text className="text-sm text-ink-light">→</Text>
        </CardFooter>
      </Card>
    </Pressable>
  );
}
