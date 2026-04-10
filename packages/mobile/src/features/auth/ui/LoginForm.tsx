import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
import {
  Button,
  Input,
  Label,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  ErrorAlert,
} from '@acme/design-system-mobile';
import { useLoginForm } from '../hooks';
import { getFieldError } from '@/lib/formUtils';

export function LoginForm() {
  const { form, serverError, setServerError, isPending } = useLoginForm();

  return (
    <View className="w-full max-w-sm">
      <View className="mb-8 items-center">
        <Text
          className="text-3xl text-ink"
          style={{ fontFamily: 'SourceSerif4_600SemiBold' }}
        >
          ProtoPal
        </Text>
        <Text
          className="mt-1 text-sm text-ink-muted"
          style={{ fontFamily: 'Karla_400Regular' }}
        >
          Your notes, your way
        </Text>
      </View>

      <Card testID="login-card">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
          {serverError && (
            <ErrorAlert
              testID="login-alert-error"
              message={serverError}
              onDismiss={() => setServerError(null)}
            />
          )}

          <form.Field name="email">
            {(field) => (
              <View className="gap-2">
                <Label>Email</Label>
                <Input
                  testID="login-input-email"
                  value={field.state.value}
                  onChangeText={(text) => field.handleChange(text)}
                  onBlur={() => field.handleBlur()}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <Text className="text-sm text-red-500">{getFieldError(field.state.meta.errors)}</Text>
                )}
              </View>
            )}
          </form.Field>

          <form.Field name="password">
            {(field) => (
              <View className="gap-2">
                <Label>Password</Label>
                <Input
                  testID="login-input-password"
                  value={field.state.value}
                  onChangeText={(text) => field.handleChange(text)}
                  onBlur={() => field.handleBlur()}
                  secureTextEntry
                />
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <Text className="text-sm text-red-500">{getFieldError(field.state.meta.errors)}</Text>
                )}
                <Text
                  className="mt-1 text-sm text-ink-light"
                  style={{ fontFamily: 'Karla_400Regular' }}
                >
                  Forgot password?
                </Text>
              </View>
            )}
          </form.Field>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button
            testID="login-btn-submit"
            className="w-full"
            disabled={isPending}
            loading={isPending}
            onPress={() => form.handleSubmit()}
          >
            Sign In
          </Button>
          <View className="flex-row items-center gap-1">
            <Text
              className="text-sm text-ink-muted"
              style={{ fontFamily: 'Karla_400Regular' }}
            >
              Don't have an account?
            </Text>
            <Link href="/(auth)/register" asChild>
              <Pressable testID="login-link-register">
                <Text
                  className="text-sm text-brand"
                  style={{ fontFamily: 'Karla_500Medium' }}
                >
                  Sign up
                </Text>
              </Pressable>
            </Link>
          </View>
        </CardFooter>
      </Card>
    </View>
  );
}
