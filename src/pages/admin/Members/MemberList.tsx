import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "~/components/dashboard/ui/avatar/Avatar";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

import {
  TableHead,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "~/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useToast } from "~/hooks/use-toast";
import { format } from "date-fns";
import Spinner from "~/pages/user/Spinner";
import { memberService } from "~/services/admin/memberService";
import {
  MemberResponse,
  MemberQueryOptions,
  MemberCreateInput,
} from "~/types/member";
import { PaginationControls } from "~/components/common/PaginationControls";


// Component for Member Management
const MemberManagement: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  // State variables
  const [members, setMembers] = useState<MemberResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchInputValue, setSearchInputValue] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] =
    useState<boolean>(false);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] =
    useState<boolean>(false);
  const [selectedMember, setSelectedMember] = useState<MemberResponse | null>(
    null,
  );
  const [newMember, setNewMember] = useState<MemberCreateInput>({
    name: "",
    email: "",
    password: "",
    gender: undefined,
    phone: "",
    dateOfBirth: "",
    address: "",
    status: "active",
    isVerified: false,
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });

  // Status counts
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    active: 0,
    inactive: 0,
    pending: 0,
    banned: 0,
  });

  // Sort configuration
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "created_at",
    direction: "desc",
  });

  // Thêm useRef để lưu trữ timeout cho debounce
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fetch members data with filtering, sorting, and pagination
  const fetchMembers = useCallback(
    async (page = pagination.currentPage) => {
      setIsLoading(true);
      try {
        // Prepare query options
        const queryOptions: MemberQueryOptions = {
          page,
          limit: pagination.limit,
          search: searchTerm || undefined,
          status: activeTab !== "all" ? (activeTab as any) : undefined,
          sortBy: sortConfig.key,
          sortOrder: sortConfig.direction,
        };

        // Call API
        const response = await memberService.getAllMembers(queryOptions);

        if (response.success && response.data) {
          setMembers(response.data.members);
          setPagination({
            currentPage: response.data.currentPage,
            totalPages: response.data.totalPages,
            totalItems: response.data.totalMembers,
            limit: pagination.limit,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Lỗi",
            description:
              response.message || "Không thể tải danh sách thành viên",
          });
        }
      } catch (error) {
        console.error("Error fetching members:", error);
        toast({
          variant: "destructive",
          title: "Lỗi",
          description:
            "Không thể tải danh sách thành viên. Vui lòng thử lại sau.",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [pagination.limit, searchTerm, activeTab, sortConfig, toast],
  );

  // Fetch stats for member counts
  const fetchMemberStats = async () => {
    try {
      const response = await memberService.getMemberStats();
      if (response.success && response.data) {
        setStatusCounts({
          all: response.data.total,
          active: response.data.active,
          inactive: response.data.inactive,
          pending: response.data.pending,
          banned: response.data.banned,
        });
      }
    } catch (error) {
      console.error("Error fetching member stats:", error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchMembers(1);
    fetchMemberStats();
  }, [fetchMembers]);

  // Không tự động gọi API khi các filter thay đổi nữa
  // Tách biệt việc theo dõi các thay đổi với việc gọi API

  // Xử lý thay đổi trong input tìm kiếm với debounce
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInputValue(value);

    // Xóa timeout trước đó nếu có
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Đặt timeout mới
    searchTimeout.current = setTimeout(() => {
      setSearchTerm(value);
      setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset về trang đầu tiên khi tìm kiếm
      fetchMembers(1);
    }, 500); // 500ms debounce
  };

  // Xử lý khi người dùng nhấn Enter để tìm kiếm ngay lập tức
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Xóa timeout đang chờ nếu có
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Cập nhật searchTerm ngay lập tức
    setSearchTerm(searchInputValue);
    setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset về trang đầu tiên
    fetchMembers(1);
  };


  // Handle sort
  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";

    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    // Gọi fetchMembers sau khi cập nhật state
    setTimeout(() => {
      fetchMembers(1);
    }, 0);
  };

  // Handle status change
  const handleStatusChange = async (
    memberId: string,
    newStatus: "active" | "inactive" | "pending" | "banned",
  ) => {
    try {
      const response = await memberService.updateMemberStatus(
        memberId,
        newStatus,
      );

      if (response.success) {
        // Update local state to reflect changes
        setMembers((prevMembers) =>
          prevMembers.map((member) =>
            member._id === memberId
              ? { ...member, status: newStatus, updated_at: new Date() }
              : member,
          ),
        );

        // Refetch stats to update counts
        fetchMemberStats();

        toast({
          title: "Trạng thái đã được cập nhật",
          description: `Thành viên đã được ${newStatus === "active" ? "kích hoạt" : newStatus === "inactive" ? "vô hiệu hóa" : newStatus === "banned" ? "cấm" : "đặt chờ xử lý"}.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description:
            response.message || "Không thể cập nhật trạng thái thành viên",
        });
      }
    } catch (error) {
      console.error("Error updating member status:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description:
          "Không thể cập nhật trạng thái thành viên. Vui lòng thử lại sau.",
      });
    }
  };

  // Handle delete member
  const handleDeleteMember = async () => {
    if (!selectedMember) return;

    try {
      const response = await memberService.deleteMember(selectedMember._id);

      if (response.success) {
        // Remove from local state
        setMembers((prevMembers) =>
          prevMembers.filter((member) => member._id !== selectedMember._id),
        );

        // Update counts
        fetchMemberStats();

        toast({
          title: "Thành viên đã được xóa",
          description: `Thành viên ${selectedMember.name} đã được xóa khỏi hệ thống.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: response.message || "Không thể xóa thành viên",
        });
      }
    } catch (error) {
      console.error("Error deleting member:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa thành viên. Vui lòng thử lại sau.",
      });
    } finally {
      setIsConfirmDeleteDialogOpen(false);
      setSelectedMember(null);
    }
  };

  // Xử lý phân trang
  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    setPagination((prev) => ({ ...prev, currentPage: page }));
    fetchMembers(page);
  };

  // Handle form input change for new member
  const handleInputChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ) => {
    const { id, value } = e.target;

    setNewMember((prev) => ({
      ...prev,
      [id]: id === "isVerified" ? value === "true" : value,
    }));
  };

  // Handle checkbox changes for new member form
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target;
    setNewMember((prev) => ({ ...prev, [id]: checked }));
  };

  // Handle creating new member
  const handleCreateMember = async () => {
    try {
      const response = await memberService.createMember(newMember);

      if (response.success && response.data) {
        // Add to local state
        setMembers((prev) => [response.data as MemberResponse, ...prev]);

        // Update counts
        fetchMemberStats();

        toast({
          title: "Thành công",
          description: "Thêm thành viên mới thành công",
        });

        // Reset form and close dialog
        setNewMember({
          name: "",
          email: "",
          password: "",
          gender: undefined,
          phone: "",
          dateOfBirth: "",
          address: "",
          status: "active",
          isVerified: false,
        });
        setIsAddMemberDialogOpen(false);
      } else {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: response.message || "Không thể tạo thành viên mới",
        });
      }
    } catch (error) {
      console.error("Error creating member:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tạo thành viên mới. Vui lòng thử lại sau.",
      });
    }
  };

  // Handle view member details
  const handleViewMemberDetails = (member: MemberResponse) => {
    navigate(`/admin/members/${member._id}`);
  };

  // Format date
  const formatDate = (date: Date) => {
    return format(new Date(date), "dd/MM/yyyy");
  };

  // Status badge component
  const StatusBadge: React.FC<{ status: MemberResponse["status"] }> = ({
    status,
  }) => {
    const statusConfig = {
      active: {
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        label: "Hoạt động",
      },
      inactive: {
        color:
          "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
        label: "Không hoạt động",
      },
      pending: {
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        label: "Chờ xử lý",
      },
      banned: {
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        label: "Đã cấm",
      },
    };

    return (
      <span
        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig[status].color}`}
      >
        {statusConfig[status].label}
      </span>
    );
  };

  // Xóa timeout khi component unmount
  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  // Các phần còn lại của component...

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <div className="mb-4 flex flex-col justify-between gap-4 sm:mb-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
            Quản lý thành viên
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
            Quản lý thông tin và trạng thái của các thành viên trong hệ thống.
          </p>
        </div>
        <Button
          onClick={() => setIsAddMemberDialogOpen(true)}
          className="flex items-center gap-2 whitespace-nowrap"
          size="sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-4 w-4 sm:h-5 sm:w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          <span className="text-sm sm:text-base">Thêm thành viên</span>
        </Button>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:mb-6">
        <div>
          <div className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Tìm kiếm theo tên, email..."
                  className="h-9 pl-10 text-sm sm:h-10"
                  value={searchInputValue}
                  onChange={handleSearchInputChange}
                />
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Responsive Tab Layout */}
      <div className="mb-4 overflow-x-auto sm:mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="no-scrollbar flex w-full overflow-x-auto pb-1 sm:w-auto">
            <TabsTrigger
              value="all"
              className="whitespace-nowrap text-xs sm:text-sm"
            >
              Tất cả{" "}
              <span className="ml-1 rounded-full bg-gray-200 px-1.5 py-0.5 text-xs dark:bg-gray-700">
                {statusCounts.all}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="whitespace-nowrap text-xs sm:text-sm"
            >
              Đang Hoạt động{" "}
              <span className="ml-1 rounded-full bg-green-100 px-1.5 py-0.5 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-400">
                {statusCounts.active}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="inactive"
              className="whitespace-nowrap text-xs sm:text-sm"
            >
              Không hoạt động{" "}
              <span className="ml-1 rounded-full bg-gray-200 px-1.5 py-0.5 text-xs dark:bg-gray-700">
                {statusCounts.inactive}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="whitespace-nowrap text-xs sm:text-sm"
            >
              Chờ xử lý{" "}
              <span className="ml-1 rounded-full bg-yellow-100 px-1.5 py-0.5 text-xs text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                {statusCounts.pending}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="banned"
              className="whitespace-nowrap text-xs sm:text-sm"
            >
              Đã cấm{" "}
              <span className="ml-1 rounded-full bg-red-100 px-1.5 py-0.5 text-xs text-red-800 dark:bg-red-900/30 dark:text-red-400">
                {statusCounts.banned}
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="rounded-lg border bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center sm:h-64">
            <Spinner size="lg" />
          </div>
        ) : !members || members.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 p-4 text-center sm:h-64">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-8 w-8 text-gray-400 sm:h-12 sm:w-12"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
            <h3 className="text-base font-medium text-gray-900 dark:text-white sm:text-lg">
              Không tìm thấy thành viên nào
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
              Không có thành viên nào phù hợp với tìm kiếm của bạn.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead
                      className="min-w-[200px]"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center">
                        Tên thành viên
                        {sortConfig.key === "name" && (
                          <span className="ml-1">
                            {sortConfig.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="min-w-[200px]"
                      onClick={() => handleSort("email")}
                    >
                      <div className="flex items-center">
                        Email
                        {sortConfig.key === "email" && (
                          <span className="ml-1">
                            {sortConfig.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[150px]">
                      Số điện thoại
                    </TableHead>
                    <TableHead
                      className="min-w-[120px]"
                      onClick={() => handleSort("created_at")}
                    >
                      <div className="flex items-center">
                        Ngày tạo
                        {sortConfig.key === "created_at" && (
                          <span className="ml-1">
                            {sortConfig.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[120px]">Trạng thái</TableHead>
                    <TableHead className="w-[100px]">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member, index) => (
                    <TableRow key={member._id}>
                      <TableCell>
                        {(pagination.currentPage - 1) * pagination.limit +
                          index +
                          1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={`http://localhost:5000/${member.avatar}`}
                            alt={member.name}
                            name={member.name}
                            size="md"
                          />
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {member.gender === "male"
                                ? "Nam"
                                : member.gender === "female"
                                  ? "Nữ"
                                  : "Khác"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{member.email}</span>
                          {member.isVerified ? (
                            <span className="text-xs text-green-600 dark:text-green-400">
                              Đã xác thực
                            </span>
                          ) : (
                            <span className="text-xs text-yellow-600 dark:text-yellow-400">
                              Chưa xác thực
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{member.phone || "—"}</TableCell>
                      <TableCell>{formatDate(member.created_at)}</TableCell>
                      <TableCell>
                        <StatusBadge status={member.status} />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="h-5 w-5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
                                />
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewMemberDetails(member)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="mr-2 h-4 w-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              Xem chi tiết
                            </DropdownMenuItem>

                            {member.status !== "active" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(member._id, "active")
                                }
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className="mr-2 h-4 w-4 text-green-600"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                Kích hoạt
                              </DropdownMenuItem>
                            )}

                            {member.status !== "inactive" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(member._id, "inactive")
                                }
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className="mr-2 h-4 w-4 text-gray-600"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                  />
                                </svg>
                                Vô hiệu hóa
                              </DropdownMenuItem>
                            )}

                            {member.status !== "banned" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusChange(member._id, "banned")
                                }
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className="mr-2 h-4 w-4 text-red-600"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                                  />
                                </svg>
                                Cấm tài khoản
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuItem
                              className="text-red-600 focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-950 dark:focus:text-red-400"
                              onClick={() => {
                                setSelectedMember(member);
                                setIsConfirmDeleteDialogOpen(true);
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="mr-2 h-4 w-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                />
                              </svg>
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden">
              {members.map((member, index) => (
                <div
                  key={member._id}
                  className="border-b p-4 dark:border-gray-700"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={`http://localhost:5000/${member.avatar}`}
                        alt={member.name}
                        name={member.name}
                        size="sm"
                      />
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {member.gender === "male"
                            ? "Nam"
                            : member.gender === "female"
                              ? "Nữ"
                              : "Khác"}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-4 w-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
                            />
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewMemberDetails(member)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="mr-2 h-4 w-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          Xem chi tiết
                        </DropdownMenuItem>

                        {member.status !== "active" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(member._id, "active")
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="mr-2 h-4 w-4 text-green-600"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Kích hoạt
                          </DropdownMenuItem>
                        )}

                        {member.status !== "inactive" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(member._id, "inactive")
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="mr-2 h-4 w-4 text-gray-600"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                              />
                            </svg>
                            Vô hiệu hóa
                          </DropdownMenuItem>
                        )}

                        {member.status !== "banned" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(member._id, "banned")
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="mr-2 h-4 w-4 text-red-600"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                              />
                            </svg>
                            Cấm tài khoản
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                          className="text-red-600 focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-950 dark:focus:text-red-400"
                          onClick={() => {
                            setSelectedMember(member);
                            setIsConfirmDeleteDialogOpen(true);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="mr-2 h-4 w-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                            />
                          </svg>
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="grid grid-cols-1 gap-1 text-xs sm:text-sm">
                    <div className="flex justify-between border-b border-gray-100 py-1 dark:border-gray-800">
                      <span className="text-gray-500 dark:text-gray-400">
                        Email:
                      </span>
                      <span className="text-right font-medium">
                        {member.email}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 py-1 dark:border-gray-800">
                      <span className="text-gray-500 dark:text-gray-400">
                        Xác thực:
                      </span>
                      {member.isVerified ? (
                        <span className="text-green-600 dark:text-green-400">
                          Đã xác thực
                        </span>
                      ) : (
                        <span className="text-yellow-600 dark:text-yellow-400">
                          Chưa xác thực
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between border-b border-gray-100 py-1 dark:border-gray-800">
                      <span className="text-gray-500 dark:text-gray-400">
                        Số điện thoại:
                      </span>
                      <span>{member.phone || "—"}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 py-1 dark:border-gray-800">
                      <span className="text-gray-500 dark:text-gray-400">
                        Ngày tạo:
                      </span>
                      <span>{formatDate(member.created_at)}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-gray-500 dark:text-gray-400">
                        Trạng thái:
                      </span>
                      <StatusBadge status={member.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add Member Dialog */}
      <Dialog
        open={isAddMemberDialogOpen}
        onOpenChange={setIsAddMemberDialogOpen}
      >
        <DialogContent className="max-w-[95vw] p-4 sm:max-w-md sm:p-6">
          <DialogHeader>
            <DialogTitle>Thêm thành viên mới</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 sm:py-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1 block text-xs font-medium sm:mb-2 sm:text-sm"
                >
                  Tên thành viên
                </label>
                <Input
                  id="name"
                  placeholder="Nhập tên thành viên"
                  value={newMember.name}
                  onChange={handleInputChange}
                  className="h-8 text-xs sm:h-10 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-xs font-medium sm:mb-2 sm:text-sm"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Nhập email"
                  value={newMember.email}
                  onChange={handleInputChange}
                  className="h-8 text-xs sm:h-10 sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="password"
                  className="mb-1 block text-xs font-medium sm:mb-2 sm:text-sm"
                >
                  Mật khẩu
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={newMember.password}
                  onChange={handleInputChange}
                  className="h-8 text-xs sm:h-10 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="mb-1 block text-xs font-medium sm:mb-2 sm:text-sm"
                >
                  Số điện thoại
                </label>
                <Input
                  id="phone"
                  placeholder="Nhập số điện thoại"
                  value={newMember.phone}
                  onChange={handleInputChange}
                  className="h-8 text-xs sm:h-10 sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="gender"
                  className="mb-1 block text-xs font-medium sm:mb-2 sm:text-sm"
                >
                  Giới tính
                </label>
                <select
                  id="gender"
                  value={newMember.gender || ""}
                  onChange={handleInputChange}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs sm:h-10 sm:py-2 sm:text-sm"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="dateOfBirth"
                  className="mb-1 block text-xs font-medium sm:mb-2 sm:text-sm"
                >
                  Ngày sinh
                </label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={newMember.dateOfBirth as string}
                  onChange={handleInputChange}
                  className="h-8 text-xs sm:h-10 sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="status"
                  className="mb-1 block text-xs font-medium sm:mb-2 sm:text-sm"
                >
                  Trạng thái
                </label>
                <select
                  id="status"
                  value={newMember.status || ""}
                  onChange={handleInputChange}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs sm:h-10 sm:py-2 sm:text-sm"
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                  <option value="pending">Chờ xử lý</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="isVerified"
                  className="mb-1 block text-xs font-medium sm:mb-2 sm:text-sm"
                >
                  Xác minh tài khoản
                </label>
                <select
                  id="isVerified"
                  value={newMember.isVerified ? "true" : "false"}
                  onChange={handleInputChange}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs sm:h-10 sm:py-2 sm:text-sm"
                >
                  <option value="false">Chưa xác minh</option>
                  <option value="true">Đã xác minh</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="address"
                className="mb-1 block text-xs font-medium sm:mb-2 sm:text-sm"
              >
                Địa chỉ
              </label>
              <Input
                id="address"
                placeholder="Nhập địa chỉ"
                value={newMember.address}
                onChange={handleInputChange}
                className="h-8 text-xs sm:h-10 sm:text-sm"
              />
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsAddMemberDialogOpen(false)}
              className="h-8 w-full text-xs sm:h-10 sm:w-auto sm:text-sm"
            >
              Hủy
            </Button>
            <Button
              onClick={handleCreateMember}
              className="h-8 w-full text-xs sm:h-10 sm:w-auto sm:text-sm"
            >
              Thêm thành viên
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={isConfirmDeleteDialogOpen}
        onOpenChange={setIsConfirmDeleteDialogOpen}
      >
        <DialogContent className="max-w-[95vw] p-4 sm:max-w-md sm:p-6">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa thành viên</DialogTitle>
          </DialogHeader>

          <div className="py-2 sm:py-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
              Bạn có chắc chắn muốn xóa thành viên{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {selectedMember?.name}
              </span>{" "}
              khỏi hệ thống? Hành động này không thể hoàn tác.
            </p>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsConfirmDeleteDialogOpen(false)}
              className="h-8 w-full text-xs sm:h-10 sm:w-auto sm:text-sm"
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteMember}
              className="h-8 w-full text-xs sm:h-10 sm:w-auto sm:text-sm"
            >
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pagination Component */}
      {pagination.totalItems > 0 && (
        <div className="mt-4">
          <div className="flex flex-col justify-between border-t border-gray-200 pb-1 pt-3 dark:border-gray-700 sm:flex-row sm:items-center">
            <div className="mb-2 sm:mb-0">
              <p className="text-xs text-gray-700 dark:text-gray-300 sm:text-sm">
                Hiển thị{" "}
                <span className="font-medium">
                  {(pagination.currentPage - 1) * pagination.limit + 1}
                </span>{" "}
                đến{" "}
                <span className="font-medium">
                  {Math.min(
                    pagination.currentPage * pagination.limit,
                    pagination.totalItems,
                  )}
                </span>{" "}
                trong tổng số{" "}
                <span className="font-medium">{pagination.totalItems}</span> kết
                quả
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <PaginationControls
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              className="flex justify-center sm:justify-end"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberManagement;
