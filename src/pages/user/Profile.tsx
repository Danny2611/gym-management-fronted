import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";

import { Edit, Save, X } from "lucide-react";

import { cn } from "~/lib/utils";
import { toast } from "~/hooks/use-toast";
import { memberService } from "~/services/memberService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import ProfileImage from "~/components/user/ProfileImage";
import PageMeta from "~/components/dashboard/common/PageMeta";
type UserData = {
  avatar: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: Date | null;
  address: string;
};
// Validation schema with more detailed error messages and complex validation
const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Tên phải có ít nhất 2 ký tự")
    .max(100, "Tên không được quá 100 ký tự"),
  phone: z
    .string()
    .regex(
      /^(\+84|84|0)?[1-9][0-9]{8,9}$/,
      "Số điện thoại không hợp lệ (10-11 số, bắt đầu bằng 0, 84 hoặc +84)",
    ),
  gender: z.enum(["male", "female", "other"], {
    errorMap: () => ({ message: "Vui lòng chọn giới tính" }),
  }),
  dateOfBirth: z.date().refine(
    (date) => {
      const now = new Date();
      const minAgeDate = new Date(now.setFullYear(now.getFullYear() - 10));
      const maxAgeDate = new Date(now.setFullYear(now.getFullYear() - 100));
      return date <= minAgeDate && date >= maxAgeDate;
    },
    { message: "Bạn phải từ 10-100 tuổi" },
  ),
  address: z
    .string()
    .min(5, "Địa chỉ phải có ít nhất 5 ký tự")
    .max(255, "Địa chỉ không được quá 255 ký tự")
    .optional(),
});

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData>({
    avatar: "",
    name: "",
    email: "",
    phone: "",
    gender: "",
    dateOfBirth: null,
    address: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      phone: "",
      gender: undefined,
      dateOfBirth: undefined,
      address: "",
    },
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await memberService.getCurrentProfile();
      // console.log("data of user: ", response);
      if (response.success && response.data) {
        const profileData = {
          avatar: response.data.avatar || "",
          name: response.data.name || "",
          email: response.data.email || "",
          phone: response.data.phone || "",
          gender: response.data.gender || "",
          dateOfBirth: response.data.dateOfBirth
            ? new Date(response.data.dateOfBirth)
            : null,
          address: response.data.address || "",
        };

        setUserData(profileData);
        form.reset({
          name: profileData.name,
          phone: profileData.phone,
          gender: profileData.gender as any,
          dateOfBirth: profileData.dateOfBirth || undefined,
          address: profileData.address,
        });
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin người dùng",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi tải thông tin cá nhân",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    try {
      // Chỉ gửi các trường đã thay đổi
      const updateData: Record<string, any> = {};

      if (data.name !== userData.name) updateData.name = data.name;
      if (data.phone !== userData.phone) updateData.phone = data.phone;
      if (data.gender !== userData.gender) updateData.gender = data.gender;
      if (data.dateOfBirth !== userData.dateOfBirth)
        updateData.dateOfBirth = data.dateOfBirth;
      if (data.address !== userData.address) updateData.address = data.address;

      const response = await memberService.updateProfile(updateData);

      if (response.success) {
        toast({
          title: "Thành công",
          description: "Cập nhật thông tin thành công",
          variant: "default",
        });
        await fetchUserProfile();
        setIsEditing(false);
      } else {
        // Xử lý lỗi từ server
        if (response.errors) {
          response.errors.forEach((err: any) => {
            toast({
              title: "Lỗi",
              description: err.msg,
              variant: "destructive",
            });
            // Cập nhật lỗi cho form react-hook-form
            form.setError(err.path, {
              type: "manual",
              message: err.msg,
            });
          });
        } else {
          toast({
            title: "Lỗi",
            description: response.message || "Cập nhật thất bại",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      console.error("Chi tiết lỗi:", error.response?.data);

      // Xử lý lỗi từ axios
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err: any) => {
          toast({
            title: "Lỗi",
            description: err.msg,
            variant: "destructive",
          });
          // Cập nhật lỗi cho form react-hook-form
          form.setError(err.path, {
            type: "manual",
            message: err.msg,
          });
        });
      } else {
        toast({
          title: "Lỗi",
          description:
            error.response?.data?.message || "Lỗi khi cập nhật thông tin",
          variant: "destructive",
        });
      }
    }
  };

  const handleCancel = () => {
    form.reset({
      name: userData.name,
      phone: userData.phone,
      gender: userData.gender as any,
      dateOfBirth: userData.dateOfBirth || undefined,
      address: userData.address,
    });
    setIsEditing(false);
  };

  const handleAvatarChange = async (file: File) => {
    try {
      const response = await memberService.updateAvatar(file);
      if (response.success && response.data?.avatar) {
        setUserData((prev) => ({
          ...prev,
          avatar: response.data!.avatar,
        }));
        toast({
          title: "Thành công",
          description: "Cập nhật ảnh đại diện thành công",
          variant: "default",
        });
      } else {
        toast({
          title: "Lỗi",
          description: response.message || "Cập nhật ảnh đại diện thất bại",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating avatar:", error);
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi cập nhật ảnh đại diện",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8 dark:bg-gray-900 sm:px-6 lg:px-8">
      <PageMeta
        title="Thông tin cá nhân | GymManagement"
        description="Xem và cập nhật thông tin cá nhân"
      />

      <Card className="mx-auto max-w-4xl bg-white shadow-lg dark:bg-gray-800">
        <CardHeader className="bg-blue-600 text-white dark:bg-blue-800">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              Thông tin cá nhân
            </CardTitle>
            {/* {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-blue-50 dark:bg-gray-700 dark:text-blue-400 dark:hover:bg-gray-600"
              >
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={form.handleSubmit(onSubmit)}
                  className="bg-green-500 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-600"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Lưu
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  className="bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-600"
                >
                  <X className="mr-2 h-4 w-4" />
                  Hủy
                </Button>
              </div>
            )} */}
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-blue-50 dark:bg-gray-700 dark:text-blue-400 dark:hover:bg-gray-600"
              >
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="w-full md:w-1/3">
              <ProfileImage
                avatar={userData.avatar}
                name={userData.name}
                editable={isEditing}
                onChange={handleAvatarChange}
              />
            </div>

            <div className="w-full md:w-2/3">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Email Field (readonly) */}
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          value={userData.email}
                          readOnly
                          className="bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                        />
                      </FormControl>
                    </FormItem>

                    {/* Name Field */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 dark:text-gray-300">
                            Họ và tên
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nhập họ và tên"
                              {...field}
                              readOnly={!isEditing}
                              className={cn(
                                "w-full",
                                !isEditing
                                  ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                                  : "border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:focus:ring-blue-400",
                              )}
                            />
                          </FormControl>
                          <FormMessage className="text-red-500 dark:text-red-400" />
                        </FormItem>
                      )}
                    />

                    {/* Phone Field */}
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 dark:text-gray-300">
                            Số điện thoại
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nhập số điện thoại"
                              {...field}
                              readOnly={!isEditing}
                              className={cn(
                                "w-full",
                                !isEditing
                                  ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                                  : "border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:focus:ring-blue-400",
                              )}
                            />
                          </FormControl>
                          <FormMessage className="text-red-500 dark:text-red-400" />
                        </FormItem>
                      )}
                    />

                    {/* Gender Field */}
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 dark:text-gray-300">
                            Giới tính
                          </FormLabel>
                          {isEditing ? (
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="border-gray-300 dark:border-gray-600 dark:bg-gray-700">
                                  <SelectValue placeholder="Chọn giới tính" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="dark:bg-gray-800">
                                <SelectItem value="male">Nam</SelectItem>
                                <SelectItem value="female">Nữ</SelectItem>
                                <SelectItem value="other">Khác</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              value={
                                field.value === "male"
                                  ? "Nam"
                                  : field.value === "female"
                                    ? "Nữ"
                                    : "Khác"
                              }
                              readOnly
                              className="bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                            />
                          )}
                          <FormMessage className="text-red-500 dark:text-red-400" />
                        </FormItem>
                      )}
                    />

                    {/* Date of Birth Field */}
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem className="flex flex-col gap-2">
                          <FormLabel>Ngày sinh</FormLabel>
                          {isEditing ? (
                            <DatePicker
                              selected={field.value}
                              onChange={(date) => field.onChange(date)}
                              dateFormat="dd/MM/yyyy"
                              showYearDropdown
                              scrollableYearDropdown
                              yearDropdownItemNumber={100}
                              minDate={new Date("1925-01-01")}
                              maxDate={new Date()}
                              className="w-full rounded-md border border-gray-300 p-2"
                            />
                          ) : (
                            <Input
                              value={
                                field.value
                                  ? field.value.toLocaleDateString("vi-VN")
                                  : ""
                              }
                              readOnly
                              className="bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                            />
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Address Field - Full Width */}
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">
                          Địa chỉ
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nhập địa chỉ"
                            {...field}
                            readOnly={!isEditing}
                            className={cn(
                              "w-full",
                              !isEditing
                                ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                                : "border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:focus:ring-blue-400",
                            )}
                          />
                        </FormControl>
                        <FormMessage className="text-red-500 dark:text-red-400" />
                      </FormItem>
                    )}
                  />

                  {isEditing && (
                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        variant="destructive"
                        onClick={handleCancel}
                        className="bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-600"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Hủy
                      </Button>
                      <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Lưu thay đổi
                      </Button>
                    </div>
                  )}
                </form>
              </Form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
