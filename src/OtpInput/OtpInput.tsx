import * as React from "react";
import { forwardRef, useImperativeHandle } from "react";
import { Platform, Pressable, Text, TextInput, View } from "react-native";
import { styles } from "./OtpInput.styles";
import { OtpInputProps, OtpInputRef } from "./OtpInput.types";
import { VerticalStick } from "./VerticalStick";
import { useOtpInput } from "./useOtpInput";

export const OtpInput = forwardRef<OtpInputRef, OtpInputProps>((props, ref) => {
  const {
    models: { text, inputRef, focusedInputIndex, isFocused, placeholder },
    actions: { clear, handlePress, handleTextChange, focus, handleFocus, handleBlur },
    forms: { setTextWithRef },
  } = useOtpInput(props);
  const {
    disabled,
    numberOfDigits = 6,
    autoFocus = true,
    hideStick,
    focusColor = "#A4D0A4",
    focusStickBlinkingDuration,
    secureTextEntry = false,
    theme = {},
    textInputProps,
    type = "numeric",
  } = props;
  const {
    containerStyle,
    inputsContainerStyle,
    pinCodeContainerStyle,
    pinCodeTextStyle,
    focusStickStyle,
    focusedPinCodeContainerStyle,
    filledPinCodeContainerStyle,
    disabledPinCodeContainerStyle,
    placeholderTextStyle,
  } = theme;

  useImperativeHandle(ref, () => ({ clear, focus, setValue: setTextWithRef }));

  const generatePinCodeContainerStyle = (isFocusedContainer: boolean, char: string) => {
    const stylesArray = [styles.codeContainer, pinCodeContainerStyle];
    if (focusColor && isFocusedContainer) {
      stylesArray.push({ borderColor: focusColor });
    }

    if (focusedPinCodeContainerStyle && isFocusedContainer) {
      stylesArray.push(focusedPinCodeContainerStyle);
    }

    if (filledPinCodeContainerStyle && Boolean(char)) {
      stylesArray.push(filledPinCodeContainerStyle);
    }

    if (disabledPinCodeContainerStyle && disabled) {
      stylesArray.push(disabledPinCodeContainerStyle);
    }

    return stylesArray;
  };

  const placeholderStyle = {
    opacity: !!placeholder ? 0.5 : pinCodeTextStyle?.opacity || 1,
    ...(!!placeholder ? placeholderTextStyle : []),
  };

  return (
    <View style={[styles.container, containerStyle, inputsContainerStyle]}>
      {Array(numberOfDigits)
        .fill(0)
        .map((_, index) => {
          const isPlaceholderCell = !!placeholder && !text?.[index];
          const char = isPlaceholderCell ? placeholder?.[index] || " " : text[index];
          const isFocusedInput = index === focusedInputIndex && !disabled && Boolean(isFocused);
          const isFilledLastInput = text.length === numberOfDigits && index === text.length - 1;
          const isFocusedContainer = isFocusedInput || (isFilledLastInput && Boolean(isFocused));

          return (
            <Pressable
              key={`${char}-${index}`}
              disabled={disabled}
              onPress={handlePress}
              style={generatePinCodeContainerStyle(isFocusedContainer, char)}
              testID="otp-input"
              accessibilityLabel="otp-input"
            >
              {isFocusedInput && !hideStick ? (
                <VerticalStick
                  focusColor={focusColor}
                  style={focusStickStyle}
                  focusStickBlinkingDuration={focusStickBlinkingDuration}
                />
              ) : (
                <Text
                  style={[
                    styles.codeText,
                    pinCodeTextStyle,
                    isPlaceholderCell ? placeholderStyle : {},
                  ]}
                >
                  {char && secureTextEntry ? "•" : char}
                </Text>
              )}
            </Pressable>
          );
        })}
      <TextInput
        value={text}
        onChangeText={handleTextChange}
        maxLength={numberOfDigits}
        inputMode={type === "numeric" ? type : "text"}
        textContentType="oneTimeCode"
        ref={inputRef}
        autoFocus={autoFocus}
        secureTextEntry={secureTextEntry}
        autoComplete={Platform.OS === "android" ? "sms-otp" : "one-time-code"}
        aria-disabled={disabled}
        editable={!disabled}
        testID="otp-input-hidden"
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...textInputProps}
        style={[styles.hiddenInput, textInputProps?.style]}
      />
    </View>
  );
});
