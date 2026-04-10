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
import { useTranslation } from '@acme/i18n';
import { useRegistrationForm } from '../hooks';
import { getFieldError } from '@/lib/formUtils';

export function RegisterForm() {
  const { form, serverError, setServerError, isLoading } = useRegistrationForm();
  const { t } = useTranslation('auth');
  const { t: tc } = useTranslation('common');

  return (
    <View className="w-full max-w-sm">
      <View className="mb-8 items-center">
        <Text
          className="text-3xl text-ink"
          style={{ fontFamily: 'SourceSerif4_600SemiBold' }}
        >
          {tc('appName')}
        </Text>
        <Text
          className="mt-1 text-sm text-ink-muted"
          style={{ fontFamily: 'Karla_400Regular' }}
        >
          {tc('tagline')}
        </Text>
      </View>

      <Card testID="register-card">
        <CardHeader>
          <CardTitle>{t('register.title')}</CardTitle>
          <CardDescription>{t('register.description')}</CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
          {serverError && (
            <ErrorAlert
              testID="register-alert-error"
              message={serverError}
              onDismiss={() => setServerError(null)}
            />
          )}

          <View className="flex-row gap-4">
            <form.Field name="firstName">
              {(field) => (
                <View className="flex-1 gap-2">
                  <Label>{t('register.firstNameLabel')}</Label>
                  <Input
                    testID="register-input-first-name"
                    value={field.state.value}
                    onChangeText={(text) => field.handleChange(text)}
                    onBlur={() => field.handleBlur()}
                    autoCapitalize="words"
                  />
                  {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                    <Text className="text-sm text-red-500">{getFieldError(field.state.meta.errors)}</Text>
                  )}
                </View>
              )}
            </form.Field>

            <form.Field name="lastName">
              {(field) => (
                <View className="flex-1 gap-2">
                  <Label>{t('register.lastNameLabel')}</Label>
                  <Input
                    testID="register-input-last-name"
                    value={field.state.value}
                    onChangeText={(text) => field.handleChange(text)}
                    onBlur={() => field.handleBlur()}
                    autoCapitalize="words"
                  />
                  {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                    <Text className="text-sm text-red-500">{getFieldError(field.state.meta.errors)}</Text>
                  )}
                </View>
              )}
            </form.Field>
          </View>

          <form.Field name="email">
            {(field) => (
              <View className="gap-2">
                <Label>{t('register.emailLabel')}</Label>
                <Input
                  testID="register-input-email"
                  value={field.state.value}
                  onChangeText={(text) => field.handleChange(text)}
                  onBlur={() => field.handleBlur()}
                  placeholder={t('register.placeholder.email')}
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
                <Label>{t('register.passwordLabel')}</Label>
                <Input
                  testID="register-input-password"
                  value={field.state.value}
                  onChangeText={(text) => field.handleChange(text)}
                  onBlur={() => field.handleBlur()}
                  secureTextEntry
                />
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <Text className="text-sm text-red-500">{getFieldError(field.state.meta.errors)}</Text>
                )}
                <Text
                  className="text-xs text-ink-light"
                  style={{ fontFamily: 'Karla_400Regular' }}
                >
                  {t('register.passwordHint')}
                </Text>
              </View>
            )}
          </form.Field>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button
            testID="register-btn-submit"
            className="w-full"
            disabled={isLoading}
            loading={isLoading}
            onPress={() => form.handleSubmit()}
          >
            {t('register.submit')}
          </Button>
          <View className="flex-row items-center gap-1">
            <Text
              className="text-sm text-ink-muted"
              style={{ fontFamily: 'Karla_400Regular' }}
            >
              {t('register.hasAccount')}
            </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable testID="register-link-login">
                <Text
                  className="text-sm text-brand"
                  style={{ fontFamily: 'Karla_500Medium' }}
                >
                  {t('register.signIn')}
                </Text>
              </Pressable>
            </Link>
          </View>
        </CardFooter>
      </Card>
    </View>
  );
}
