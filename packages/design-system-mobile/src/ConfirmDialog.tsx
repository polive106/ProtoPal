import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Button } from './Button';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  testID?: string;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  testID,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" testID={testID}>
      <Pressable className="flex-1 items-center justify-center bg-black/50" onPress={onCancel}>
        <Pressable className="mx-6 w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
          <Text className="text-lg font-semibold text-gray-900">{title}</Text>
          <Text className="mt-2 text-sm text-gray-500">{message}</Text>
          <View className="mt-6 flex-row justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              onPress={onCancel}
              testID={testID ? `${testID}-cancel` : undefined}
            >
              {cancelLabel}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onPress={onConfirm}
              testID={testID ? `${testID}-confirm` : undefined}
            >
              {confirmLabel}
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
