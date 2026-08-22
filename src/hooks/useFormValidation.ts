import { useState, useCallback } from "react";
import * as validators from "../utils/inputValidator";

interface FormErrors {
  [key: string]: string | undefined;
}

interface FormWarnings {
  [key: string]: string[] | undefined;
}

export function useFormValidation<T extends Record<string, any>>(
  initialData: T
) {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [warnings, setWarnings] = useState<FormWarnings>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback(
    (field: string, value: string) => {
      let result: any = { isValid: true };

      switch (field) {
        case "fullName":
          result = validators.validateFullName(value);
          break;
        case "idNumber":
          result = validators.validateEcuadorianId(value);
          break;
        case "email":
          result = validators.validateEmail(value);
          break;
        case "city":
          result = validators.validateCity(value);
          break;
        case "organization":
          result = validators.validateOrganization(value);
          break;
        case "reason":
          result = validators.validateReason(value);
          break;
        case "location":
          result = validators.validateLocation(value);
          break;
        default:
          return;
      }

      setErrors((prev) => ({
        ...prev,
        [field]: result.isValid ? undefined : result.error,
      }));

      if (result.warnings) {
        setWarnings((prev) => ({
          ...prev,
          [field]: result.warnings,
        }));
      } else {
        setWarnings((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    },
    []
  );

  const handleChange = useCallback(
    (field: keyof T, value: any) => {
      setData((prev) => ({
        ...prev,
        [field]: value,
      }));

      if (touched[field as string] && typeof value === 'string') {
        validateField(field as string, value);
      }
    },
    [touched, validateField]
  );

  const handleBlur = useCallback(
    (field: keyof T) => {
      setTouched((prev) => ({
        ...prev,
        [field]: true,
      }));
      if (typeof data[field] === 'string') {
        validateField(field as string, data[field]);
      }
    },
    [data, validateField]
  );

  const validateAll = useCallback(() => {
    const result = validators.validateP12FormData({
      fullName: data.fullName || "",
      idNumber: data.idNumber || "",
      email: data.email || "",
      city: data.city || "",
      organization: data.organization || "",
      reason: data.reason,
      location: data.location,
    });

    setErrors(result.errors);
    setWarnings(result.warnings);
    setTouched(
      Object.keys(data).reduce(
        (acc, key) => ({
          ...acc,
          [key]: true,
        }),
        {}
      )
    );

    return result;
  }, [data]);

  return {
    data,
    errors,
    warnings,
    touched,
    handleChange,
    handleBlur,
    validateField,
    validateAll,
    setData,
  };
}
