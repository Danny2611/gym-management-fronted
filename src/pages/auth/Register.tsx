// src/pages/user/Register.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

// Validation functions
const validateField = (fieldName: string, value: string, formData?: any) => {
  switch (fieldName) {
    case 'name':
      if (!value.trim()) return 'Tên không được để trống';
      if (value.length < 2) return 'Tên phải từ 2-50 ký tự';
      if (value.length > 50) return 'Tên phải từ 2-50 ký tự';
      return '';
    
    case 'email':
      if (!value) return 'Email không được để trống';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return 'Email không hợp lệ';
      return '';
    
    case 'phone':
      if (!value) return 'Số điện thoại không được để trống';
      const phoneRegex = /^\d{10,11}$/;
      if (!phoneRegex.test(value)) return 'Số điện thoại không hợp lệ';
      return '';
    
    case 'password':
      if (!value) return 'Mật khẩu không được để trống';
      if (value.length < 8) return 'Mật khẩu phải ít nhất 8 ký tự bao gồm ít nhất 1 chữ số và 1 chữ in hoa';
      if (!/\d/.test(value)) return 'Mật khẩu phải chứa ít nhất 1 số';
        if (!/[A-Z]/.test(value)) return 'Mật khẩu phải chứa ít nhất 1 chữ hoa';
      return '';
    
    case 'confirmPassword':
      if (!value) return 'Xác nhận mật khẩu không được để trống';
      if (formData && value !== formData.password) return 'Mật khẩu không khớp';
      return '';
    
    default:
      return '';
  }
};

// Custom hook for debounced validation
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  
  const [touchedFields, setTouchedFields] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    phone: false,
  });
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  // Debounced values for validation
  const debouncedName = useDebounce(formData.name, 500);
  const debouncedEmail = useDebounce(formData.email, 500);
  const debouncedPhone = useDebounce(formData.phone, 500);
  const debouncedPassword = useDebounce(formData.password, 500);
  const debouncedConfirmPassword = useDebounce(formData.confirmPassword, 500);

  // Validate individual fields when debounced values change
  useEffect(() => {
    if (touchedFields.name) {
      setFieldErrors(prev => ({
        ...prev,
        name: validateField('name', debouncedName)
      }));
    }
  }, [debouncedName, touchedFields.name]);

  useEffect(() => {
    if (touchedFields.email) {
      setFieldErrors(prev => ({
        ...prev,
        email: validateField('email', debouncedEmail)
      }));
    }
  }, [debouncedEmail, touchedFields.email]);

  useEffect(() => {
    if (touchedFields.phone) {
      setFieldErrors(prev => ({
        ...prev,
        phone: validateField('phone', debouncedPhone)
      }));
    }
  }, [debouncedPhone, touchedFields.phone]);

  useEffect(() => {
    if (touchedFields.password) {
      setFieldErrors(prev => ({
        ...prev,
        password: validateField('password', debouncedPassword)
      }));
    }
  }, [debouncedPassword, touchedFields.password]);

  useEffect(() => {
    if (touchedFields.confirmPassword) {
      setFieldErrors(prev => ({
        ...prev,
        confirmPassword: validateField('confirmPassword', debouncedConfirmPassword, formData)
      }));
    }
  }, [debouncedConfirmPassword, touchedFields.confirmPassword, formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Mark all fields as touched
    setTouchedFields({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      phone: true,
    });

    // Validate all fields
    const errors = {
      name: validateField('name', formData.name),
      email: validateField('email', formData.email),
      phone: validateField('phone', formData.phone),
      password: validateField('password', formData.password),
      confirmPassword: validateField('confirmPassword', formData.confirmPassword, formData),
    };

    setFieldErrors(errors);

    // Check if there are any errors
    const hasErrors = Object.values(errors).some(error => error !== '');
    if (hasErrors) {
      setError("Vui lòng kiểm tra lại thông tin");
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });
      // Redirect happens in register function in AuthContext
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Đăng ký không thành công. Vui lòng thử lại.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-32 flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="mb-20 mt-20 w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Đăng Ký</h1>
          <p className="mt-2 text-gray-600">Tạo tài khoản FittLife của bạn</p>
        </div>

        {error && (
          <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Họ và tên
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
                fieldErrors.name 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {fieldErrors.name && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Địa chỉ email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
                fieldErrors.email 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Số điện thoại
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
                fieldErrors.phone 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {fieldErrors.phone && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.phone}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Mật khẩu
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
                fieldErrors.password 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {fieldErrors.password ? (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">
                Mật khẩu phải có ít nhất 6 ký tự và chứa ít nhất 1 số
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Xác nhận mật khẩu
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 ${
                fieldErrors.confirmPassword 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? "Đang xử lý..." : "Đăng ký"}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;