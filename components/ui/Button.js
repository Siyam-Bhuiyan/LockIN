import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";

const Button = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  style,
  textStyle,
  disabled,
  loading,
  icon,
}) => {
  const { theme } = useTheme();

  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      paddingVertical: size === "small" ? 10 : size === "large" ? 18 : 14,
      paddingHorizontal: size === "small" ? 16 : size === "large" ? 28 : 20,
      elevation: variant === "outline" ? 0 : 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: variant === "outline" ? 0 : 0.1,
      shadowRadius: 8,
      opacity: disabled ? 0.6 : 1,
    };

    switch (variant) {
      case "primary":
        return { ...baseStyle, backgroundColor: theme.primary };
      case "secondary":
        return { ...baseStyle, backgroundColor: theme.secondary };
      case "success":
        return { ...baseStyle, backgroundColor: theme.success };
      case "outline":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: theme.primary,
        };
      default:
        return { ...baseStyle, backgroundColor: theme.primary };
    }
  };

  const getTextStyle = () => {
    const baseStyle = {
      fontSize: size === "small" ? 14 : size === "large" ? 18 : 16,
      fontWeight: "700",
      letterSpacing: 0.5,
      marginLeft: icon ? 8 : 0,
    };

    const color = variant === "outline" ? theme.primary : "#ffffff";
    return { ...baseStyle, color };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? theme.primary : "#ffffff"}
          size={size === "small" ? "small" : "default"}
        />
      ) : (
        <>
          {icon && icon}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;
