import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Dumbbell,
  Target,
  User,
  ListChecks,
  Plus,
  Trash2,
  Info,
  ChevronRight,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  workoutService,
  WorkoutSuggestionParams,
  CreateWorkoutScheduleParams,
} from "~/services/workoutService";
import {
  muscleGroups,
  workoutGoals,
  experienceLevels,
  equipmentTypes,
  WorkoutSuggestion,
  ScheduledExercise,
} from "~/types/workout";

const CreateWorkoutPage: React.FC = () => {
  const navigate = useNavigate();

  // State cho form gợi ý
  const [muscleGroup, setMuscleGroup] = useState<string>("");
  const [goal, setGoal] = useState<
    "weight_loss" | "muscle_gain" | "endurance" | "strength" | "flexibility"
  >("strength");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">(
    "beginner",
  );
  const [equipment, setEquipment] = useState<
    "bodyweight" | "dumbbell" | "barbell" | "machine" | "mixed"
  >("mixed");

  // State cho gợi ý bài tập
  const [workoutSuggestion, setWorkoutSuggestion] =
    useState<WorkoutSuggestion | null>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState<boolean>(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  // State cho form lịch tập
  const [date, setDate] = useState<string>("");
  const [timeStart, setTimeStart] = useState<string>("");
  const [duration, setDuration] = useState<number>(60);
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>(
    [],
  );
  const [location, setLocation] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [exercises, setExercises] = useState<ScheduledExercise[]>([]);
  const [showAddExerciseForm, setShowAddExerciseForm] =
    useState<boolean>(false);

  // Thêm state mới để lưu trữ danh sách địa điểm
  const [trainingLocations, setTrainingLocations] = useState<string[]>([]);
  const [loadingLocations, setLoadingLocations] = useState<boolean>(false);
  const [locationsError, setLocationsError] = useState<string | null>(null);

  // State cho form thêm bài tập
  const [exerciseName, setExerciseName] = useState<string>("");
  const [exerciseSets, setExerciseSets] = useState<number>(4);
  const [exerciseReps, setExerciseReps] = useState<number>(12);
  const [exerciseWeight, setExerciseWeight] = useState<number>(0);

  // State cho trạng thái submit
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Tạo giá trị mặc định
  useEffect(() => {
    // Thiết lập ngày mặc định là hôm nay
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    setDate(formattedDate);

    // Thiết lập giờ mặc định là giờ hiện tại (làm tròn đến 30 phút tiếp theo)
    const hours = today.getHours();
    const minutes = today.getMinutes() > 30 ? 0 : 30;
    const nextHour = minutes === 0 ? hours + 1 : hours;
    const formattedTime = `${nextHour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    setTimeStart(formattedTime);
    // Lấy danh sách địa điểm tập luyện
    fetchTrainingLocations();
  }, []);

  // Hàm lấy danh sách địa điểm tập luyện
  const fetchTrainingLocations = async () => {
    try {
      setLoadingLocations(true);
      setLocationsError(null);

      const response = await workoutService.getMemberTrainingLocations();

      if (response.success && response.data) {
        setTrainingLocations(response.data);

        // Thiết lập giá trị mặc định cho location nếu có dữ liệu
        if (response.data.length > 0) {
          setLocation(response.data[0]);
        }
      } else {
        setLocationsError(
          response.message || "Không thể lấy danh sách địa điểm tập luyện",
        );
        // Sử dụng danh sách mặc định nếu API thất bại
        setTrainingLocations([
          "Phòng tập chính - Tầng 1",
          "Khu vực tự do tập luyện",
          "Phòng Yoga & Pilates",
          "Khu vực cardio",
          "Phòng tập riêng VIP",
          "Tại nhà",
        ]);
      }
    } catch (error) {
      setLocationsError("Đã xảy ra lỗi khi kết nối với máy chủ");
      console.error("Error getting training locations:", error);
      // Sử dụng danh sách mặc định nếu có lỗi
      setTrainingLocations([
        "Phòng tập chính - Tầng 1",
        "Khu vực tự do tập luyện",
        "Phòng Yoga & Pilates",
        "Khu vực cardio",
        "Phòng tập riêng VIP",
        "Tại nhà",
      ]);
    } finally {
      setLoadingLocations(false);
    }
  };

  // Xử lý lấy gợi ý bài tập
  const handleGetSuggestion = async () => {
    if (!muscleGroup) {
      setSuggestionError("Vui lòng chọn nhóm cơ trước khi lấy gợi ý");
      return;
    }

    try {
      setLoadingSuggestion(true);
      setSuggestionError(null);

      const params: WorkoutSuggestionParams = {
        muscleGroup,
        goal,
        level,
        equipment,
      };
      console.log("data gợi ý:", params);
      const response = await workoutService.getWorkoutSuggestions(params);

      if (response.success && response.data) {
        setWorkoutSuggestion(response.data);

        // Tự động điền một số thông tin
        setSelectedMuscleGroups([muscleGroup]);

        // Tạo danh sách bài tập từ gợi ý
        const suggestedExercises = response.data.exercises.map((exercise) => ({
          name: exercise.name,
          sets: exercise.sets_recommended,
          reps: exercise.reps_recommended.min,
          weight: 0,
        }));

        setExercises(suggestedExercises);
      } else {
        setSuggestionError(response.message || "Không thể lấy gợi ý bài tập");
      }
    } catch (error) {
      setSuggestionError("Đã xảy ra lỗi khi kết nối với máy chủ");
      console.error("Error getting workout suggestion:", error);
    } finally {
      setLoadingSuggestion(false);
    }
  };

  // Xử lý thêm bài tập mới
  const handleAddExercise = () => {
    if (!exerciseName) {
      return;
    }

    const newExercise: ScheduledExercise = {
      name: exerciseName,
      sets: exerciseSets,
      reps: exerciseReps,
      weight: exerciseWeight,
    };

    setExercises([...exercises, newExercise]);

    // Reset form
    setExerciseName("");
    setExerciseSets(4);
    setExerciseReps(12);
    setExerciseWeight(0);
    setShowAddExerciseForm(false);
  };

  // Xử lý xóa bài tập
  const handleRemoveExercise = (index: number) => {
    const updatedExercises = [...exercises];
    updatedExercises.splice(index, 1);
    setExercises(updatedExercises);
  };

  // Xử lý chọn nhiều nhóm cơ
  const handleMuscleGroupToggle = (group: string) => {
    if (selectedMuscleGroups.includes(group)) {
      setSelectedMuscleGroups(
        selectedMuscleGroups.filter((item) => item !== group),
      );
    } else {
      setSelectedMuscleGroups([...selectedMuscleGroups, group]);
    }
  };

  // Xử lý tạo lịch tập
  const handleCreateWorkout = async () => {
    // Kiểm tra dữ liệu đầu vào
    if (
      !date ||
      !timeStart ||
      !location ||
      selectedMuscleGroups.length === 0 ||
      exercises.length === 0
    ) {
      setFormError("Vui lòng điền đầy đủ thông tin lịch tập");
      return;
    }

    // Chuyển đổi định dạng thời gian
    const formattedDate = date;
    const formattedDateTime = `${date}T${timeStart}:00`;

    try {
      setSubmitting(true);
      setFormError(null);

      const scheduleData: CreateWorkoutScheduleParams = {
        date: formattedDate,
        timeStart: formattedDateTime,
        duration,
        muscle_groups: selectedMuscleGroups,
        location,
        notes,
        exercises,
        workout_suggestion_id: workoutSuggestion?._id,
      };

      const response = await workoutService.createWorkoutSchedule(scheduleData);

      if (response.success && response.data) {
        setFormSuccess("Tạo lịch tập thành công!");

        // Chuyển hướng sau 2 giây
        setTimeout(() => {
          navigate("/user/my-schedule");
        }, 2000);
      } else {
        setFormError(response.message || "Không thể tạo lịch tập");
      }
    } catch (error) {
      setFormError("Đã xảy ra lỗi khi kết nối với máy chủ");
      console.error("Error creating workout schedule:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Tạo lịch tập cá nhân
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Phần 1: Form lấy gợi ý */}
        {/* <div className="lg:col-span-1">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Lấy gợi ý bài tập
            </h2>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nhóm cơ
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 p-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={muscleGroup}
                onChange={(e) => setMuscleGroup(e.target.value)}
              >
                <option value="">-- Chọn nhóm cơ --</option>
                {muscleGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mục tiêu tập luyện
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 p-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={goal}
                onChange={(e) => setGoal(e.target.value as any)}
              >
                {workoutGoals.map((goalOption) => (
                  <option key={goalOption.value} value={goalOption.value}>
                    {goalOption.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Cấp độ
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 p-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={level}
                onChange={(e) => setLevel(e.target.value as any)}
              >
                {experienceLevels.map((levelOption) => (
                  <option key={levelOption.value} value={levelOption.value}>
                    {levelOption.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Thiết bị
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 p-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={equipment}
                onChange={(e) => setEquipment(e.target.value as any)}
              >
                {equipmentTypes.map((equipmentOption) => (
                  <option
                    key={equipmentOption.value}
                    value={equipmentOption.value}
                  >
                    {equipmentOption.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGetSuggestion}
              disabled={loadingSuggestion || !muscleGroup}
              className={`w-full rounded-lg px-4 py-2 font-medium text-white ${
                loadingSuggestion || !muscleGroup
                  ? "cursor-not-allowed bg-blue-400 dark:bg-blue-500"
                  : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              }`}
            >
              {loadingSuggestion ? "Đang tạo gợi ý..." : "Lấy gợi ý bài tập"}
            </button>

            {suggestionError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-900/30 dark:text-red-400">
                <div className="flex items-center">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  {suggestionError}
                </div>
              </div>
            )}
          </div>
        </div> */}

        {/* Phần 2: Form tạo lịch tập */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Thông tin lịch tập
            </h2>

            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Calendar className="mr-1 inline-block h-4 w-4" />
                  Ngày tập
                </label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-gray-300 p-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Clock className="mr-1 inline-block h-4 w-4" />
                  Thời gian bắt đầu
                </label>
                <input
                  type="time"
                  className="w-full rounded-lg border border-gray-300 p-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={timeStart}
                  onChange={(e) => setTimeStart(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                <Clock className="mr-1 inline-block h-4 w-4" />
                Thời lượng (phút)
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 p-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
              >
                <option value="30">30 phút</option>
                <option value="45">45 phút</option>
                <option value="60">60 phút</option>
                <option value="90">90 phút</option>
                <option value="120">120 phút</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                <Dumbbell className="mr-1 inline-block h-4 w-4" />
                Nhóm cơ (chọn một hoặc nhiều)
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {muscleGroups.map((group) => (
                  <div
                    key={group}
                    onClick={() => handleMuscleGroupToggle(group)}
                    className={`cursor-pointer rounded-lg border p-2 text-center text-sm ${
                      selectedMuscleGroups.includes(group)
                        ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300"
                        : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                    }`}
                  >
                    {group}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                <MapPin className="mr-1 inline-block h-4 w-4" />
                Địa điểm tập
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 p-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="">-- Chọn địa điểm --</option>
                {trainingLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="mb-2 flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
                <div className="flex items-center">
                  <ListChecks className="mr-1 inline-block h-4 w-4" />
                  Danh sách bài tập
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddExerciseForm(!showAddExerciseForm)}
                  className="flex items-center rounded-lg bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  {showAddExerciseForm ? "Hủy" : "Thêm bài tập"}
                </button>
              </label>

              {showAddExerciseForm && (
                <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tên bài tập
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-gray-300 p-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        value={exerciseName}
                        onChange={(e) => setExerciseName(e.target.value)}
                        placeholder="Nhập tên bài tập"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Số hiệp (Sets)
                      </label>
                      <input
                        type="number"
                        className="w-full rounded-lg border border-gray-300 p-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        value={exerciseSets}
                        onChange={(e) =>
                          setExerciseSets(parseInt(e.target.value))
                        }
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Số lần lặp (Reps)
                      </label>
                      <input
                        type="number"
                        className="w-full rounded-lg border border-gray-300 p-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        value={exerciseReps}
                        onChange={(e) =>
                          setExerciseReps(parseInt(e.target.value))
                        }
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Trọng lượng (kg)
                      </label>
                      <input
                        type="number"
                        className="w-full rounded-lg border border-gray-300 p-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        value={exerciseWeight}
                        onChange={(e) =>
                          setExerciseWeight(parseInt(e.target.value))
                        }
                        min="0"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <button
                        type="button"
                        onClick={handleAddExercise}
                        className="w-full rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                        disabled={!exerciseName}
                      >
                        <Plus className="mr-1 inline-block h-4 w-4" />
                        Thêm vào danh sách
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {exercises.length > 0 ? (
                <div className="max-h-60 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-sm text-gray-700 dark:text-gray-300">
                    <thead className="sticky top-0 bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      <tr>
                        <th className="px-4 py-2 text-left">Bài tập</th>
                        <th className="px-4 py-2 text-center">Sets</th>
                        <th className="px-4 py-2 text-center">Reps</th>
                        <th className="px-4 py-2 text-center">kg</th>
                        <th className="px-4 py-2 text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exercises.map((exercise, index) => (
                        <tr
                          key={index}
                          className="border-t border-gray-200 dark:border-gray-700"
                        >
                          <td className="px-4 py-2">{exercise.name}</td>
                          <td className="px-4 py-2 text-center">
                            {exercise.sets}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {exercise.reps}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {exercise.weight}
                          </td>
                          <td className="px-4 py-2 text-center">
                            <button
                              onClick={() => handleRemoveExercise(index)}
                              className="inline-flex items-center rounded-lg p-1 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400">
                  <Info className="mx-auto mb-1 h-5 w-5" />
                  <p>Chưa có bài tập nào được thêm</p>
                  <p className="mt-1 text-xs">
                    Sử dụng nút "Thêm bài tập" hoặc lấy gợi ý bài tập
                  </p>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Ghi chú
              </label>
              <textarea
                className="w-full rounded-lg border border-gray-300 p-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Nhập ghi chú về lịch tập này (tùy chọn)"
                rows={3}
              ></textarea>
            </div>

            {formError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-900/30 dark:text-red-400">
                <div className="flex items-center">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  {formError}
                </div>
              </div>
            )}

            {formSuccess && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-900/30 dark:text-green-400">
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {formSuccess}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate("/user/workout-schedules")}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={handleCreateWorkout}
                disabled={submitting}
                className={`rounded-lg px-4 py-2 font-medium text-white ${
                  submitting
                    ? "cursor-not-allowed bg-blue-400 dark:bg-blue-500"
                    : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                }`}
              >
                {submitting ? "Đang lưu..." : "Tạo lịch tập"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Phần 3: Hiển thị gợi ý bài tập */}
      {workoutSuggestion && (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Thông tin gợi ý bài tập
          </h2>

          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
              <h3 className="mb-2 flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                <Target className="mr-2 h-4 w-4" /> Mục tiêu
              </h3>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                {workoutGoals.find((g) => g.value === workoutSuggestion.goal)
                  ?.label || workoutSuggestion.goal}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
              <h3 className="mb-2 flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                <User className="mr-2 h-4 w-4" /> Cấp độ
              </h3>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                {experienceLevels.find(
                  (l) => l.value === workoutSuggestion.level,
                )?.label || workoutSuggestion.level}
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
              <h3 className="mb-2 flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                <Dumbbell className="mr-2 h-4 w-4" /> Thiết bị
              </h3>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                {equipmentTypes.find(
                  (e) => e.value === workoutSuggestion.equipment,
                )?.label || workoutSuggestion.equipment}
              </p>
            </div>
          </div>

          <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
            <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Mô tả
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              {workoutSuggestion.exercises.map(
                (exercise) => exercise.description,
              )}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/80">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Danh sách bài tập được đề xuất
              </h3>
              <button
                type="button"
                className="flex items-center rounded-lg bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60"
                onClick={() =>
                  navigate(
                    `/exercise-library?muscle=${workoutSuggestion.muscle_group}`,
                  )
                }
              >
                Xem thêm bài tập <ChevronRight className="ml-1 h-3 w-3" />
              </button>
            </div>

            <div className="p-4">
              {workoutSuggestion.exercises.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {workoutSuggestion.exercises.map((exercise, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                    >
                      <h4 className="mb-1 font-medium text-gray-900 dark:text-white">
                        {exercise.name}
                      </h4>
                      <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                        {exercise.description}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="rounded-md bg-blue-50 p-1 text-center font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                          {exercise.sets_recommended} sets
                        </div>
                        <div className="rounded-md bg-green-50 p-1 text-center font-medium text-green-800 dark:bg-green-900/20 dark:text-green-300">
                          {`${exercise.reps_recommended.min}-${exercise.reps_recommended.max} reps`}
                        </div>
                        <div className="rounded-md bg-purple-50 p-1 text-center font-medium text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                          {exercise.rest_recommended}s nghỉ
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                  Không có bài tập nào được đề xuất
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateWorkoutPage;
