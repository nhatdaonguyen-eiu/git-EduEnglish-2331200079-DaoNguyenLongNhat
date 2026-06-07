import { useState, useEffect } from 'react';
import axios from 'axios';
import logo from './assets/logo.png';
// Nhập khẩu các mảnh ghép Lego từ thư mục components
import CourseForm from './components/CourseForm';
import CourseCard from './components/CourseCard';
import StudentPortal from './components/StudentPortal';
import RegistrationManager from './components/RegistrationManager';
import AuthPortal from './components/AuthPortal';
import TeacherPortal from './components/TeacherPortal';
import ClassroomManager from './components/ClassroomManager';
import StudentDashboard from './components/StudentDashboard';
import ProfilePage from './components/ProfilePage';
import AdminAccountsManager from './components/AdminAccountsManager';
import AdminBlogManager from './components/AdminBlogManager';
import FreeMaterialsPortal from './components/FreeMaterialsPortal';
import TuitionPaymentPortal from './components/TuitionPaymentPortal';
import Chatbot from './components/Chatbot';
import TeacherTeam from './components/TeacherTeam';
import RegisterConsultation from './components/RegisterConsultation';
import CoursesPortal from './components/CoursesPortal';

// Nhập khẩu các icon Lucide cho giao diện hiện đại và cao cấp
import { 
  BookOpen, 
  Users, 
  Calendar, 
  DollarSign, 
  UserCheck, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Globe, 
  Search, 
  Bell, 
  HelpCircle, 
  Trophy, 
  Menu, 
  X, 
  ShieldAlert, 
  Sparkles, 
  LayoutDashboard, 
  FileText, 
  User, 
  Home, 
  Award,
  ChevronRight,
  Compass,
  ChevronDown
} from 'lucide-react';

function App() {
  // Quản lý trạng thái Đăng nhập hệ thống (localStorage)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  
  // Trạng thái mở menu điều hướng mobile (responsive sidebar)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Trạng thái hiển thị Modal Đăng nhập/Đăng ký
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Phân hệ hiển thị: 
  // - 'student': Landing Page công khai dành cho tất cả học viên
  // - 'dashboard': Dashboard cá nhân phụ thuộc vào Vai trò đăng nhập (Học viên, Giáo viên, Admin)
  const [portalMode, setPortalMode] = useState('student');

  // Tab con trong trang Admin: 'courses' (Khóa học), 'registrations' (Đăng ký học), 'classrooms' (Quản lý lớp đào tạo)
  const [adminTab, setAdminTab] = useState('courses');

  // Trạng thái hiển thị Trang Hồ Sơ cá nhân
  const [showProfile, setShowProfile] = useState(false);

  // Trạng thái bảng điều khiển kiểm thử Role Switcher
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const handleOpenProfile = () => {
    setShowProfile(true);
    window.history.pushState({ modal: 'profile' }, '', '/profile');
  };

  const handleCloseProfile = () => {
    setShowProfile(false);
    if (window.location.pathname === '/profile') {
      window.history.back();
    }
  };

  // Hàm điều phối tuyến đường dựa trên đường dẫn URL (Path-based Routing Resolver)
  const handleRouting = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('orderId')) {
      setPortalMode('tuition-payment-checkout');
      setShowProfile(false);
      return;
    }

    const path = window.location.pathname;
    const saved = localStorage.getItem('user');
    const userObj = saved ? JSON.parse(saved) : null;

    if (path === '/profile') {
      if (userObj) {
        setShowProfile(true);
        if (userObj.role === 'ADMIN') {
          setPortalMode('dashboard');
        } else if (userObj.role === 'TEACHER') {
          setPortalMode('teacher-classes');
        } else if (userObj.role === 'STUDENT') {
          setPortalMode('student-dashboard');
        } else {
          setPortalMode('student');
        }
      } else {
        window.history.replaceState({}, '', '/');
        setPortalMode('student');
        setShowProfile(false);
      }
      return;
    }

    // Ẩn profile nếu không ở trang profile
    setShowProfile(false);

    if (path.startsWith('/student/')) {
      if (userObj && userObj.role === 'STUDENT') {
        const subTab = path.replace('/student/', '');
        if (['dashboard', 'lms', 'achievements', 'tuition'].includes(subTab)) {
          setPortalMode(`student-${subTab}`);
        } else {
          setPortalMode('student-dashboard');
        }
      } else {
        window.history.replaceState({}, '', '/');
        setPortalMode('student');
      }
    } else if (path.startsWith('/teacher/')) {
      if (userObj && userObj.role === 'TEACHER') {
        const subTab = path.replace('/teacher/', '');
        if (['classes', 'assignments', 'grading'].includes(subTab)) {
          setPortalMode(`teacher-${subTab}`);
        }
      } else {
        // Nếu không có quyền giáo viên, đẩy về trang chủ công khai
        window.history.replaceState({}, '', '/');
        setPortalMode('student');
      }
    } else if (path.startsWith('/admin/')) {
      if (userObj && userObj.role === 'ADMIN') {
        const subTab = path.replace('/admin/', '');
        if (['courses', 'classes', 'leads', 'billing', 'settings/payment', 'accounts', 'blogs'].includes(subTab)) {
          setPortalMode('dashboard');
          if (subTab === 'settings/payment') {
            setAdminTab('settings-payment');
          } else if (subTab === 'classes') {
            setAdminTab('classrooms');
          } else if (subTab === 'leads') {
            setAdminTab('registrations');
          } else {
            setAdminTab(subTab);
          }
        }
      } else {
        window.history.replaceState({}, '', '/');
        setPortalMode('student');
      }
    } else if (path === '/materials') {
      setPortalMode('free-materials');
    } else if (path === '/blog') {
      setPortalMode('blog');
    } else if (path === '/teachers') {
      setPortalMode('teacher-team');
    } else if (path === '/register-consultation') {
      setPortalMode('register-consultation');
    } else if (path === '/courses') {
      setPortalMode('courses-portal');
    } else if (path === '/' || path === '') {
      setPortalMode('student');
    }
  };

  // Đăng ký bộ lắng nghe sự kiện popstate để hỗ trợ nút Back/Forward của trình duyệt
  useEffect(() => {
    handleRouting();
    window.addEventListener('popstate', handleRouting);
    return () => {
      window.removeEventListener('popstate', handleRouting);
    };
  }, []);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Trạng thái Form nhập liệu Khóa học của Admin
  const initialForm = { 
    title: '', 
    description: '', 
    level: 'Beginner', 
    category: 'IELTS', 
    price: '', 
    thumbnailUrl: '',
    suitableFor: '',
    outputGoals: '',
    duration: '',
    commitment: '',
    learningMethod: '',
    syllabus: ''
  };
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [showCourseForm, setShowCourseForm] = useState(false);

  // Trạng thái tìm kiếm & bộ lọc khóa học của Admin
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [category, setCategory] = useState('');

  // Tự động chuyển đổi dashboard của Teacher sang /teacher/classes
  useEffect(() => {
    if (portalMode === 'dashboard' && currentUser?.role === 'TEACHER') {
      setPortalMode('teacher-classes');
      window.history.pushState({}, '', '/teacher/classes');
    }
  }, [portalMode, currentUser]);

  // Cơ chế Debounce tìm kiếm khóa học của Admin
  useEffect(() => {
    if (portalMode === 'dashboard' && currentUser?.role === 'ADMIN' && adminTab === 'courses') {
      const delayDebounceFn = setTimeout(() => {
        fetchCourses();
      }, 250);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [search, level, category, portalMode, adminTab, currentUser]);

  // Hàm gọi API lấy danh sách khóa học có truyền tham số lọc
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/courses', {
        params: {
          search: search || null,
          level: level || null,
          category: category || null
        }
      });
      setCourses(response.data);
    } catch (error) {
      console.error("Lỗi kết nối Backend:", error);
    } finally {
      setLoading(false);
    }
  };

  // Submit tạo mới hoặc cập nhật khóa học của Admin
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:8080/api/courses/${editingId}`, formData);
        alert("🎉 Đã cập nhật khóa học thành công!");
      } else {
        await axios.post('http://localhost:8080/api/courses', formData);
        alert("✨ Đã thêm khóa học mới thành công!");
      }
      setFormData(initialForm);
      setEditingId(null);
      setShowCourseForm(false);
      fetchCourses();
    } catch (error) {
      alert("❌ Có lỗi xảy ra khi lưu khóa học!");
    }
  };

  // Xóa mềm khóa học của Admin
  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ Bạn có chắc chắn muốn xóa khóa học này không?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/courses/${id}`);
      fetchCourses();
    } catch (error) {
      alert("❌ Không thể xóa khóa học này.");
    }
  };

  // Cập nhật giá trị nhập trong các input của form khóa học
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Khi click Sửa khóa học
  const handleEditClick = (course) => {
    setEditingId(course.id);
    setFormData({ 
      title: course.title, 
      description: course.description, 
      level: course.level, 
      category: course.category, 
      price: course.price,
      thumbnailUrl: course.thumbnailUrl || '',
      suitableFor: course.suitableFor || '',
      outputGoals: course.outputGoals || '',
      duration: course.duration || '',
      commitment: course.commitment || '',
      learningMethod: course.learningMethod || '',
      syllabus: course.syllabus || ''
    });
    setShowCourseForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Hủy chế độ sửa
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(initialForm);
    setShowCourseForm(false);
  };

  // Reset toàn bộ bộ lọc Admin
  const handleClearFilters = () => {
    setSearch('');
    setLevel('');
    setCategory('');
  };

  // Nạp danh sách khóa học lần đầu cho Admin
  useEffect(() => {
    if (portalMode === 'dashboard' && currentUser?.role === 'ADMIN' && adminTab === 'courses') {
      fetchCourses();
    }
  }, [portalMode, adminTab, currentUser]);

  // Xử lý khi Đăng nhập thành công
  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    setShowProfile(false);
    if (userData.role === 'ADMIN') {
      setPortalMode('dashboard');
      setAdminTab('courses');
      window.history.pushState({}, '', '/admin/courses');
    } else if (userData.role === 'TEACHER') {
      setPortalMode('teacher-classes');
      window.history.pushState({}, '', '/teacher/classes');
    } else if (userData.role === 'STUDENT') {
      setPortalMode('student-dashboard');
      window.history.pushState({}, '', '/student/dashboard');
    } else {
      setPortalMode('dashboard');
    }
  };

  // Xử lý khi Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
    setPortalMode('student'); // Quay về trang học viên công khai
    setShowProfile(false); // Đóng trang cá nhân nếu đang mở
    window.history.pushState({}, '', '/');
    alert("👋 Đã đăng xuất tài khoản thành công!");
  };

  // Trả về nhãn chữ hiển thị cho nút Dashboard theo vai trò người dùng
  const getDashboardNavLabel = (role) => {
    switch (role) {
      case 'ADMIN': return '⚙️ Hệ Thống Quản Trị';
      case 'TEACHER': return '👨‍🏫 Cổng Giảng Dạy';
      default: return '📖 Cổng Học Tập';
    }
  };

  // Hàm chuyển vai trò nhanh phục vụ việc kiểm thử
  const switchTestingRole = (role) => {
    if (role === 'GUEST') {
      localStorage.removeItem('user');
      setCurrentUser(null);
      setPortalMode('student');
      setShowProfile(false);
      window.history.pushState({}, '', '/');
      alert("⚡ Đã chuyển sang chế độ Guest!");
    } else {
      const mockAccounts = {
        STUDENT: {
          id: 901,
          fullName: "Nguyễn Văn Học Viên",
          email: "student.test@eduen.edu.vn",
          role: "STUDENT",
          avatarUrl: ""
        },
        TEACHER: {
          id: 902,
          fullName: "Lê Thị Giảng Viên",
          email: "teacher.test@eduen.edu.vn",
          role: "TEACHER",
          avatarUrl: ""
        },
        ADMIN: {
          id: 903,
          fullName: "Trần Minh Quản Trị",
          email: "admin.test@eduen.edu.vn",
          role: "ADMIN",
          avatarUrl: ""
        }
      };
      const selectedAccount = mockAccounts[role];
      localStorage.setItem('user', JSON.stringify(selectedAccount));
      setCurrentUser(selectedAccount);
      setShowProfile(false);
      
      if (role === 'ADMIN') {
        setPortalMode('dashboard');
        setAdminTab('courses');
        window.history.pushState({}, '', '/admin/courses');
      } else if (role === 'TEACHER') {
        setPortalMode('teacher-classes');
        window.history.pushState({}, '', '/teacher/classes');
      } else if (role === 'STUDENT') {
        setPortalMode('student-dashboard');
        window.history.pushState({}, '', '/student/dashboard');
      }
      
      alert(`⚡ Đã giả lập đăng nhập vai trò: ${role}!`);
    }
    setShowRoleSwitcher(false);
  };

  // Determine the active key for styling the current nav item
  const getActiveTabKey = () => {
    if (showProfile) return 'profile';
    if (portalMode === 'student') return 'landing-page';
    if (portalMode === 'courses-portal') return 'student-portal';
    if (portalMode === 'teacher-team') return 'teacher-team';
    if (portalMode === 'free-materials') return 'materials';
    if (portalMode === 'blog') return 'blog';
    if (portalMode === 'tuition-payment-checkout') return 'tuition-checkout';
    
    // Add mapping for actual sub-routing states
    if (portalMode === 'student-dashboard') return 'student-dash';
    if (portalMode === 'student-lms') return 'student-lms';
    if (portalMode === 'student-achievements') return 'student-achievements';
    if (portalMode === 'student-tuition') return 'student-tuition';
    
    if (portalMode === 'teacher-classes') return 'teacher-classes';
    if (portalMode === 'teacher-assignments') return 'teacher-assignments';
    if (portalMode === 'teacher-grading') return 'teacher-grading';

    if (portalMode === 'dashboard') {
      if (currentUser?.role === 'STUDENT') return 'student-dash';
      if (currentUser?.role === 'TEACHER') return 'teacher-classes';
      if (currentUser?.role === 'ADMIN') {
        if (adminTab === 'registrations') return 'admin-leads';
        if (adminTab === 'classrooms') return 'admin-classes';
        return `admin-${adminTab}`;
      }
    }
    return '';
  };

  const activeTabKey = getActiveTabKey();

  const getSidebarMenuItems = () => {
    // Shared public menu items grouped
    const publicGroups = [
      {
        title: 'Đào tạo',
        key: 'dao-tao',
        items: [
          { key: 'student-portal', label: 'Khóa học', icon: BookOpen, action: () => { setPortalMode('courses-portal'); window.history.pushState({}, '', '/courses'); setShowProfile(false); } },
          { key: 'teacher-team', label: 'Đội ngũ giảng viên', icon: Users, action: () => { setPortalMode('teacher-team'); window.history.pushState({}, '', '/teachers'); setShowProfile(false); } }
        ]
      },
      {
        title: 'Tài nguyên',
        key: 'tai-nguyen',
        items: [
          { key: 'materials', label: 'Tài liệu miễn phí', icon: Compass, action: () => { setPortalMode('free-materials'); window.history.pushState({}, '', '/materials'); setShowProfile(false); } },
          { key: 'blog', label: 'Blog & Tin tức', icon: Globe, action: () => { setPortalMode('blog'); window.history.pushState({}, '', '/blog'); setShowProfile(false); } }
        ]
      }
    ];

    if (!currentUser) {
      return { groupName: 'Guest', groups: publicGroups };
    }

    if (currentUser.role === 'STUDENT') {
      return {
        groupName: 'Học viên',
        groups: [
          {
            title: 'Học tập',
            key: 'hoc-tap',
            items: [
              { key: 'student-dash', label: 'Dashboard Học tập', icon: LayoutDashboard, action: () => { setPortalMode('student-dashboard'); window.history.pushState({}, '', '/student/dashboard'); setShowProfile(false); } },
              { key: 'student-lms', label: 'Không gian học tập', icon: BookOpen, action: () => { setPortalMode('student-lms'); window.history.pushState({}, '', '/student/lms'); setShowProfile(false); } },
              { key: 'student-achievements', label: 'Thi đua & Huy hiệu', icon: Award, action: () => { setPortalMode('student-achievements'); window.history.pushState({}, '', '/student/achievements'); setShowProfile(false); } }
            ]
          },
          {
            title: 'Tài chính',
            key: 'tai-chinh',
            items: [
              { key: 'student-tuition', label: 'Thanh toán học phí', icon: DollarSign, action: () => { setPortalMode('student-tuition'); window.history.pushState({}, '', '/student/tuition'); setShowProfile(false); } }
            ]
          },
          ...publicGroups
        ]
      };
    }

    if (currentUser.role === 'TEACHER') {
      return {
        groupName: 'Giáo viên',
        groups: [
          {
            title: 'Giảng dạy',
            key: 'giang-day',
            items: [
              { key: 'teacher-classes', label: 'Quản lý lớp học', icon: Users, action: () => { setPortalMode('teacher-classes'); window.history.pushState({}, '', '/teacher/classes'); setShowProfile(false); } },
              { key: 'teacher-assignments', label: 'Tạo bài tập', icon: FileText, action: () => { setPortalMode('teacher-assignments'); window.history.pushState({}, '', '/teacher/assignments'); setShowProfile(false); } },
              { key: 'teacher-grading', label: 'Không gian chấm điểm', icon: Award, action: () => { setPortalMode('teacher-grading'); window.history.pushState({}, '', '/teacher/grading'); setShowProfile(false); } }
            ]
          },
          ...publicGroups
        ]
      };
    }

    if (currentUser.role === 'ADMIN') {
      return {
        groupName: 'Quản trị viên',
        groups: [
          {
            title: 'Đào tạo',
            key: 'admin-dao-tao',
            items: [
              { key: 'admin-courses', label: 'Quản lý Khóa học', icon: BookOpen, action: () => { setPortalMode('dashboard'); setAdminTab('courses'); window.history.pushState({}, '', '/admin/courses'); setShowProfile(false); } },
              { key: 'admin-classes', label: 'Quản lý Lịch học', icon: Calendar, action: () => { setPortalMode('dashboard'); setAdminTab('classrooms'); window.history.pushState({}, '', '/admin/classes'); setShowProfile(false); } }
            ]
          },
          {
            title: 'Hành chính & CRM',
            key: 'admin-hanh-chinh',
            items: [
              { key: 'admin-leads', label: 'Hồ sơ Tư vấn', icon: UserCheck, action: () => { setPortalMode('dashboard'); setAdminTab('registrations'); window.history.pushState({}, '', '/admin/leads'); setShowProfile(false); } },
              { key: 'admin-accounts', label: 'Quản lý Giáo viên', icon: Users, action: () => { setPortalMode('dashboard'); setAdminTab('accounts'); window.history.pushState({}, '', '/admin/accounts'); setShowProfile(false); } }
            ]
          },
          {
            title: 'Tài chính',
            key: 'admin-tai-chinh',
            items: [
              { key: 'admin-billing', label: 'Duyệt Học phí & Hóa đơn', icon: DollarSign, action: () => { setPortalMode('dashboard'); setAdminTab('billing'); window.history.pushState({}, '', '/admin/billing'); setShowProfile(false); } },
              { key: 'admin-settings-payment', label: 'Cấu hình thanh toán', icon: Settings, action: () => { setPortalMode('dashboard'); setAdminTab('settings-payment'); window.history.pushState({}, '', '/admin/settings/payment'); setShowProfile(false); } }
            ]
          },
          {
            title: 'Tài nguyên & SEO',
            key: 'admin-tai-nguyen',
            items: [
              { key: 'admin-blogs', label: 'Quản lý Blog SEO', icon: FileText, action: () => { setPortalMode('dashboard'); setAdminTab('blogs'); window.history.pushState({}, '', '/admin/blogs'); setShowProfile(false); } },
              { key: 'materials', label: 'Tài liệu miễn phí', icon: Compass, action: () => { setPortalMode('free-materials'); window.history.pushState({}, '', '/materials'); setShowProfile(false); } },
              { key: 'blog', label: 'Blog & Tin tức', icon: Globe, action: () => { setPortalMode('blog'); window.history.pushState({}, '', '/blog'); setShowProfile(false); } }
            ]
          },
          {
            title: 'Xem Website',
            key: 'admin-xem-website',
            items: [
              { key: 'student-portal', label: 'Khóa học', icon: BookOpen, action: () => { setPortalMode('courses-portal'); window.history.pushState({}, '', '/courses'); setShowProfile(false); } },
              { key: 'teacher-team', label: 'Đội ngũ giảng viên', icon: Users, action: () => { setPortalMode('teacher-team'); window.history.pushState({}, '', '/teachers'); setShowProfile(false); } }
            ]
          }
        ]
      };
    }

    return { groupName: 'Hệ thống', groups: publicGroups };
  };

  const sidebarMenu = getSidebarMenuItems();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col relative">
      
      {/* 1. TOP PREMIUM HORIZONTAL NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-emerald-950 text-white border-b border-emerald-900 px-6 py-4 flex items-center justify-between gap-4">
        {/* Logo Section */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer shrink-0 select-none" 
          onClick={() => { setPortalMode('student'); window.history.pushState({}, '', '/'); setShowProfile(false); setIsSidebarOpen(false); }}
        >
          <img src={logo} alt="EduEnglish Logo" className="w-8 h-8 object-contain rounded-lg shadow-md" />
          <span className="text-lg font-black text-white tracking-tight">EduEnglish</span>
        </div>

        {/* Center: Desktop Menu Links */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-3 py-1 overflow-visible">
          {sidebarMenu.groups.map((group) => {
            const hasMultiple = group.items.length > 1;
            const isGroupActive = group.items.some(item => activeTabKey === item.key);
            
            if (!hasMultiple) {
              const item = group.items[0];
              const IconComponent = item.icon;
              const isActive = activeTabKey === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    item.action();
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-extrabold transition-all duration-200 cursor-pointer whitespace-nowrap border ${
                    isActive
                      ? 'bg-emerald-800 text-white border-emerald-700/50 shadow shadow-emerald-900/40'
                      : 'text-emerald-300 border-transparent hover:text-white hover:bg-emerald-900/30'
                  }`}
                >
                  <IconComponent className={`w-3.5 h-3.5 shrink-0 transition-transform ${isActive ? 'text-amber-400 scale-110' : 'text-emerald-450'}`} />
                  <span>{item.label}</span>
                </button>
              );
            }
            
            return (
              <div key={group.key} className="relative group/nav py-2">
                <button
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-extrabold transition-all duration-200 cursor-pointer whitespace-nowrap border ${
                    isGroupActive
                      ? 'bg-emerald-800 text-white border-emerald-700/50 shadow shadow-emerald-900/40'
                      : 'text-emerald-300 border-transparent hover:text-white hover:bg-emerald-900/30'
                  }`}
                >
                  <span>{group.title}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-emerald-450 group-hover/nav:rotate-180 transition-transform duration-200 ${isGroupActive ? 'text-amber-400' : ''}`} />
                </button>
                
                {/* Dropdown Menu Container */}
                <div className="absolute left-0 top-full pt-1.5 w-52 opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-200 z-50">
                  <div className="bg-white border border-slate-200/80 rounded-xl shadow-xl p-1.5 text-slate-800 text-left">
                    {group.items.map((item) => {
                      const IconComponent = item.icon;
                      const isActive = activeTabKey === item.key;
                      return (
                        <button
                          key={item.key}
                          onClick={() => {
                            item.action();
                          }}
                          className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer border-none ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-850'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-850'
                          }`}
                        >
                          <IconComponent className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Right Section: Search, Bot, User card, Mobile menu trigger */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Search box for large screens */}
          <div className="relative hidden lg:block">
            <input 
              type="text" 
              placeholder="Tìm khóa học, tài liệu..."
              className="bg-emerald-900/40 pl-8 pr-3 py-1.5 rounded-full text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/25 w-36 lg:w-44 text-emerald-100 placeholder-emerald-450 border border-emerald-850"
            />
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-emerald-450" />
          </div>

          {/* AI Bot trigger */}
          <button 
            onClick={() => {
              const event = new CustomEvent('toggleChatbot');
              window.dispatchEvent(event);
            }}
            className="text-white hover:text-amber-400 cursor-pointer p-2 bg-emerald-900/40 hover:bg-emerald-900 rounded-xl transition-all border-none flex items-center justify-center text-sm"
            title="Trợ lý ảo EduBot"
          >
            🤖
          </button>

          {/* User profile dropdown pill */}
          {currentUser ? (
            <div className="relative group">
              <div 
                onClick={handleOpenProfile} 
                className="flex items-center gap-2 bg-emerald-900/40 p-1 pr-2.5 rounded-xl border border-emerald-850 shadow-sm cursor-pointer hover:bg-emerald-900 transition-colors"
              >
                {currentUser.avatarUrl ? (
                  <img 
                    src={currentUser.avatarUrl} 
                    alt="Avatar" 
                    className="w-7 h-7 rounded-lg object-cover border border-emerald-800"
                  />
                ) : (
                  <span className="w-7 h-7 rounded-lg bg-emerald-700 text-white font-black text-[10px] flex items-center justify-center shadow">
                    {currentUser.fullName.charAt(0)}
                  </span>
                )}
                <span className="hidden sm:inline text-[11px] font-black text-emerald-250 uppercase tracking-wider">
                  {currentUser.fullName.split(' ').pop()}
                </span>
              </div>

              {/* Hover Dropdown Menu Container with padding to bridge the gap */}
              <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block hover:block z-50">
                <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-2 animate-fade-in text-slate-800 text-left">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1.5">
                    <p className="text-[11px] font-black text-slate-800 truncate">{currentUser.fullName}</p>
                    <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">{currentUser.role}</span>
                  </div>
                  
                  <button 
                    onClick={handleOpenProfile}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-655 hover:bg-slate-50 hover:text-emerald-850 rounded-lg transition-all flex items-center gap-2 cursor-pointer border-none"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    Hồ sơ của tôi
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-all flex items-center gap-2 cursor-pointer mt-1 border-t border-slate-50 pt-2 border-none"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg cursor-pointer border-none shadow transition-all active:scale-95"
            >
              Đăng Nhập
            </button>
          )}

          {/* Hamburger Menu trigger for Mobile */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900 md:hidden cursor-pointer"
          >
            {isSidebarOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
          </button>

        </div>
      </header>

      {/* 2. MOBILE MENU DROPDOWN LIST */}
      {isSidebarOpen && (
        <div className="md:hidden bg-emerald-950 text-white border-b border-emerald-900 shadow-2xl p-4 space-y-4 animate-slide-down relative z-40">
          <div className="border-b border-emerald-900/60 pb-2">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-4 opacity-60">
              {sidebarMenu.groupName}
            </span>
            <nav className="space-y-4">
              {sidebarMenu.groups.map((group) => (
                <div key={group.key} className="space-y-1">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block px-3 mb-1 opacity-70">
                    {group.title}
                  </span>
                  {group.items.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = activeTabKey === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => {
                          item.action();
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                          isActive
                            ? 'bg-emerald-800 text-white shadow shadow-emerald-900/40 border border-emerald-700/30'
                            : 'text-emerald-300 hover:text-white hover:bg-emerald-900/30'
                        }`}
                      >
                        <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-emerald-450'}`} />
                        <span>{item.label}</span>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-amber-400" />}
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>
          </div>

          {currentUser && (
            <div className="pt-2 flex items-center justify-between border-t border-emerald-900/60">
              <div className="flex items-center gap-3" onClick={() => { handleOpenProfile(); setIsSidebarOpen(false); }}>
                {currentUser.avatarUrl ? (
                  <img 
                    src={currentUser.avatarUrl} 
                    alt="Avatar" 
                    className="w-9 h-9 rounded-xl object-cover border border-emerald-800"
                  />
                ) : (
                  <span className="w-9 h-9 rounded-xl bg-emerald-700 text-white font-black text-xs flex items-center justify-center border border-emerald-600 shadow">
                    {currentUser.fullName.charAt(0)}
                  </span>
                )}
                <div className="text-left">
                  <p className="text-xs font-black text-white leading-tight">{currentUser.fullName}</p>
                  <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">{currentUser.role}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => { handleOpenProfile(); setIsSidebarOpen(false); }}
                  className="px-3 py-1.5 bg-emerald-900/50 text-emerald-250 text-xs font-bold rounded-lg border border-emerald-850 cursor-pointer"
                >
                  Hồ sơ
                </button>
                <button 
                  onClick={() => { handleLogout(); setIsSidebarOpen(false); }}
                  className="px-3 py-1.5 bg-red-950/40 text-red-300 text-xs font-bold rounded-lg border border-red-900/30 cursor-pointer"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. MAIN WORKSPACE CONTENT PANEL */}
      <div className="flex-grow flex flex-col min-h-screen overflow-x-hidden">
        
        {/* SUB-HEADER BREADCRUMB BAR */}
        <div className="bg-white border-b border-slate-200/60 px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 select-none">
            <span className="text-emerald-700 hover:underline cursor-pointer" onClick={() => { setPortalMode('student'); window.history.pushState({}, '', '/'); setShowProfile(false); }}>EduEnglish</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-slate-750">
              {activeTabKey === 'profile' && 'Cập Nhật Hồ Sơ'}
              {activeTabKey === 'student-portal' && 'Danh Sách Khóa Học'}
              {activeTabKey === 'teacher-team' && 'Đội Ngũ Giảng Viên'}
              {activeTabKey === 'materials' && 'Thư Viện Tài Liệu Miễn Phí'}
              {activeTabKey === 'blog' && 'Blog & Kiến Thức Học Tập'}
              {activeTabKey === 'tuition-checkout' && 'Thanh Toán Học Phí'}
              {activeTabKey === 'student-dash' && 'Học Viên - Dashboard'}
              {activeTabKey === 'student-lms' && 'Học Viên - Không Gian Học Tập LMS'}
              {activeTabKey === 'student-achievements' && 'Học Viên - Thi Đua & Huy Hiệu'}
              {activeTabKey === 'student-tuition' && 'Học Viên - Hóa Đơn & Học Phí'}
              {activeTabKey === 'teacher-classes' && 'Giáo Viên - Quản Lý Lớp Học'}
              {activeTabKey === 'teacher-assignments' && 'Giáo Viên - Thiết Kế Bài Tập'}
              {activeTabKey === 'teacher-grading' && 'Giáo Viên - Không Gian Chấm Điểm'}
              {activeTabKey === 'admin-courses' && 'Quản Trị - Quản Lý Khóa Học'}
              {activeTabKey === 'admin-leads' && 'Quản Trị - Hồ Sơ Tư Vấn'}
              {activeTabKey === 'admin-classes' && 'Quản Trị - Quản Lịch Lớp Học'}
              {activeTabKey === 'admin-billing' && 'Quản Trị - Duyệt Học Phí & Hóa Đơn'}
              {activeTabKey === 'admin-settings-payment' && 'Quản Trị - Cấu Hình Cổng Thanh Toán'}
              {activeTabKey === 'admin-accounts' && 'Quản Trị - Tài Khoản Giáo Viên'}
              {activeTabKey === 'admin-blogs' && 'Quản Trị - Viết Bài Blog & SEO'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-250/30 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
              {currentUser ? `Vai trò: ${currentUser.role}` : 'Guest'}
            </span>
          </div>
        </div>

        {/* Content Box wrapper */}
        <div className="flex-grow">
          {showProfile ? (
            <ProfilePage
              user={currentUser}
              onProfileUpdate={(updatedUser) => {
                const newUser = { ...currentUser, ...updatedUser };
                setCurrentUser(newUser);
                localStorage.setItem('user', JSON.stringify(newUser));
              }}
              onClose={handleCloseProfile}
              onAccountDeleted={() => {
                localStorage.removeItem('user');
                setCurrentUser(null);
                setShowProfile(false);
                setPortalMode('student');
                window.history.replaceState({}, '', '/');
                alert('❌ Tài khoản của bạn đã được xóa.');
              }}
            />
          ) : portalMode === 'student' ? (
            // GIAO DIỆN TRANG CHỦ PUBLIC LANDING PAGE CHO HỌC VIÊN
            <StudentPortal 
              onNavigate={(mode, path) => {
                setPortalMode(mode);
                if (path) window.history.pushState({}, '', path);
                setShowProfile(false);
              }}
            />
          ) : portalMode === 'courses-portal' ? (
            // GIAO DIỆN TRANG KHÓA HỌC RIÊNG BIỆT
            <CoursesPortal 
              onNavigate={(mode, path) => {
                setPortalMode(mode);
                if (path) window.history.pushState({}, '', path);
                setShowProfile(false);
              }}
              onBackToHome={() => {
                setPortalMode('student');
                window.history.pushState({}, '', '/');
                setShowProfile(false);
              }}
            />
          ) : portalMode === 'register-consultation' ? (
            // GIAO DIỆN TRANG ĐĂNG KÝ TƯ VẤN HỌC VIÊN
            <RegisterConsultation 
              onBackToHome={() => {
                setPortalMode('student');
                window.history.pushState({}, '', '/');
                setShowProfile(false);
              }}
            />
          ) : portalMode === 'teacher-team' ? (
            // GIAO DIỆN TRANG ĐỘI NGŨ GIẢNG VIÊN
            <TeacherTeam />
          ) : portalMode === 'free-materials' ? (
            // GIAO DIỆN CỔNG TÀI LIỆU HỌC TẬP MIỄN PHÍ
            <FreeMaterialsPortal currentUser={currentUser} initialView="materials" />
          ) : portalMode === 'blog' ? (
            // GIAO DIỆN CỔNG BLOG SEO MỚI CỦA TRUNG TÂM
            <FreeMaterialsPortal currentUser={currentUser} initialView="blog" />
          ) : portalMode === 'tuition-payment-checkout' ? (
            // GIAO DIỆN CỔNG THANH TOÁN HỌC PHÍ ONLINE
            <TuitionPaymentPortal 
              currentUser={currentUser} 
              onBackToDashboard={() => {
                window.history.pushState({}, document.title, window.location.pathname);
                setPortalMode('dashboard');
              }}
            />
          ) : (
            // GIAO DIỆN DASHBOARD CỦA TỪNG VAI TRÒ (ĐÃ ĐĂNG NHẬP)
            <div className="pb-20">
              
              {/* DASHBOARD HỌC VIÊN (STUDENT) */}
              {currentUser?.role === 'STUDENT' && (portalMode === 'dashboard' || portalMode.startsWith('student-')) && (
                <StudentDashboard 
                  user={currentUser} 
                  initialTab={portalMode.startsWith('student-') ? portalMode.replace('student-', '') : 'dashboard'} 
                  onTabChange={(tab) => {
                    setPortalMode(`student-${tab}`);
                    window.history.pushState({}, '', `/student/${tab}`);
                  }}
                />
              )}

              {/* DASHBOARD GIÁO VIÊN (TEACHER) */}
              {currentUser?.role === 'TEACHER' && (portalMode === 'dashboard' || portalMode.startsWith('teacher-')) && (
                <TeacherPortal 
                  user={currentUser} 
                  initialTab={portalMode.startsWith('teacher-') ? portalMode.replace('teacher-', '') : 'classes'} 
                  onTabChange={(tab) => {
                    setPortalMode(`teacher-${tab}`);
                    window.history.pushState({}, '', `/teacher/${tab}`);
                  }}
                />
              )}

              {/* DASHBOARD QUẢN TRỊ VIÊN (ADMIN) */}
              {currentUser?.role === 'ADMIN' && (
                <div>
                  {/* HEADER CHUYÊN BIỆT CHO TRANG ADMIN */}
                  <header className="py-8 text-center max-w-5xl mx-auto px-4 animate-fade-in">
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                      Quản Trị Hệ Thống EduEnglish
                    </h1>
                    <p className="text-slate-400 text-xs mt-1.5 font-bold uppercase tracking-wider">
                      Control Panel & Lead Management
                    </p>
                    
                    {/* THANH SUB-TAB BÊN TRONG TRANG ADMIN (GỒM 7 TABS) */}
                    <div className="flex justify-center gap-4 mt-6 border-b border-slate-200/60 max-w-4xl mx-auto pb-3 font-semibold flex-wrap">
                      <button 
                        onClick={() => { setAdminTab('courses'); window.history.pushState({}, '', '/admin/courses'); }}
                        className={`pb-1 px-4 text-sm font-extrabold border-b-2 transition-all cursor-pointer ${
                          adminTab === 'courses'
                            ? 'border-orange-500 text-orange-600'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        📚 Quản Lý Khóa Học
                      </button>
                      <button 
                        onClick={() => { setAdminTab('registrations'); window.history.pushState({}, '', '/admin/leads'); }}
                        className={`pb-1 px-4 text-sm font-extrabold border-b-2 transition-all cursor-pointer ${
                          adminTab === 'registrations'
                            ? 'border-orange-500 text-orange-600'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        📞 Hồ Sơ Tư Vấn
                      </button>
                      <button 
                        onClick={() => { setAdminTab('classrooms'); window.history.pushState({}, '', '/admin/classes'); }}
                        className={`pb-1 px-4 text-sm font-extrabold border-b-2 transition-all cursor-pointer ${
                          adminTab === 'classrooms'
                            ? 'border-orange-500 text-orange-600'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        🏫 Quản Lịch Lớp Học
                      </button>
                      <button 
                        onClick={() => { setAdminTab('billing'); window.history.pushState({}, '', '/admin/billing'); }}
                        className={`pb-1 px-4 text-sm font-extrabold border-b-2 transition-all cursor-pointer ${
                          adminTab === 'billing'
                            ? 'border-orange-500 text-orange-600'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        💵 Duyệt Học Phí & Hóa Đơn
                      </button>
                      <button 
                        onClick={() => { setAdminTab('settings-payment'); window.history.pushState({}, '', '/admin/settings/payment'); }}
                        className={`pb-1 px-4 text-sm font-extrabold border-b-2 transition-all cursor-pointer ${
                          adminTab === 'settings-payment'
                            ? 'border-orange-500 text-orange-600'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        ⚙️ Cấu Hình Cổng
                      </button>
                      <button 
                        onClick={() => { setAdminTab('accounts'); window.history.pushState({}, '', '/admin/accounts'); }}
                        className={`pb-1 px-4 text-sm font-extrabold border-b-2 transition-all cursor-pointer ${
                          adminTab === 'accounts'
                            ? 'border-orange-500 text-orange-600'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        👨‍🏫 Quản Lý Giáo Viên
                      </button>
                      <button 
                        onClick={() => { setAdminTab('blogs'); window.history.pushState({}, '', '/admin/blogs'); }}
                        className={`pb-1 px-4 text-sm font-extrabold border-b-2 transition-all cursor-pointer ${
                          adminTab === 'blogs'
                            ? 'border-orange-500 text-orange-600'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        ✍️ Quản Lý Blog SEO
                      </button>
                    </div>
                  </header>

                  <div className="px-4">
                    {adminTab === 'courses' && (
                      <>
                        <CourseForm 
                          formData={formData} 
                          onChange={handleInputChange} 
                          onSubmit={handleSubmit} 
                          editingId={editingId} 
                          onCancel={handleCancelEdit} 
                        />
                        <div className="max-w-5xl mx-auto mb-8">
                          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-end">
                            <div className="w-full md:flex-1 flex flex-col gap-1.5">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tìm kiếm (Admin)</span>
                              <input 
                                type="text" 
                                placeholder="Tìm tên hoặc mô tả khóa học..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm text-slate-800 placeholder-slate-405 bg-slate-50/50"
                              />
                            </div>
                            <div className="w-full sm:w-1/2 md:w-48 flex flex-col gap-1.5">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cấp độ</span>
                              <select 
                                value={level} 
                                onChange={(e) => setLevel(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm text-slate-700 bg-slate-50/50 font-medium cursor-pointer"
                              >
                                <option value="">Tất cả Cấp độ</option>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                              </select>
                            </div>
                            <div className="w-full sm:w-1/2 md:w-48 flex flex-col gap-1.5">
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Danh mục</span>
                              <select 
                                value={category} 
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none text-sm text-slate-700 bg-slate-50/50 font-medium cursor-pointer"
                              >
                                <option value="">Tất cả Danh mục</option>
                                <option value="IELTS">IELTS</option>
                                <option value="TOEIC">TOEIC</option>
                                <option value="Giao tiếp">Giao tiếp</option>
                              </select>
                            </div>
                            {(search || level || category) && (
                              <button 
                                onClick={handleClearFilters}
                                className="w-full sm:w-auto px-4 py-2.5 text-sm font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-xl transition-all cursor-pointer border border-orange-100 text-center flex items-center justify-center"
                              >
                                🔄 Reset
                              </button>
                            )}
                          </div>
                        </div>

                        <main className="max-w-5xl mx-auto">
                          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3">
                            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                              📚 Danh Sách Khóa Học Đang Mở 
                              <span className="px-2.5 py-0.5 bg-slate-200/60 rounded-full text-xs font-bold text-slate-600">
                                {courses.length}
                              </span>
                            </h2>
                          </div>
                          {loading ? (
                             <div className="py-20 flex flex-col items-center justify-center gap-3">
                               <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                               <p className="text-sm font-semibold text-slate-400">Đang đồng bộ dữ liệu...</p>
                             </div>
                          ) : courses.length === 0 ? (
                             <div className="py-20 bg-white rounded-3xl border border-slate-100 shadow-sm text-center max-w-lg mx-auto px-6">
                               <p className="text-4xl">🎓</p>
                               <h3 className="text-base font-bold text-slate-700 mt-2">Chưa có khóa học nào hoạt động</h3>
                             </div>
                          ) : (
                            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                    <th className="p-4 pl-6">Khóa học</th>
                                    <th className="p-4">Cấp độ</th>
                                    <th className="p-4">Danh mục</th>
                                    <th className="p-4">Thời lượng</th>
                                    <th className="p-4">Học phí</th>
                                    <th className="p-4 pr-6 text-right">Thao tác</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-150 font-semibold text-slate-750">
                                  {courses.map((course) => (
                                    <tr key={course.id} className="hover:bg-slate-50/30 transition-all">
                                      <td className="p-4 pl-6">
                                        <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-lg shrink-0">
                                            📚
                                          </div>
                                          <div>
                                            <p className="font-extrabold text-xs text-slate-800">{course.title}</p>
                                            <p className="text-[9px] text-slate-400 font-bold mt-0.5 truncate max-w-[280px]" title={course.description}>
                                              {course.description || "Chưa có mô tả chi tiết."}
                                            </p>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase ${
                                          course.level === 'Advanced' ? 'bg-red-50 text-red-700 border-red-200' :
                                          course.level === 'Intermediate' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                          'bg-emerald-50 text-emerald-700 border-emerald-250'
                                        }`}>
                                          {course.level}
                                        </span>
                                      </td>
                                      <td className="p-4">
                                        <span className="text-slate-655 font-bold uppercase tracking-wider">{course.category}</span>
                                      </td>
                                      <td className="p-4 text-slate-500 font-bold">
                                        ⏱️ {course.duration || "12 tuần"}
                                      </td>
                                      <td className="p-4 font-black text-slate-800">
                                        {course.price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price) : '0 đ'}
                                      </td>
                                      <td className="p-4 pr-6 text-right">
                                        <div className="flex justify-end gap-2 items-center">
                                          <button 
                                            type="button"
                                            onClick={() => handleEditClick(course)}
                                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-lg text-[10px] transition-all cursor-pointer border border-slate-200/50"
                                          >
                                            Sửa ✏️
                                          </button>
                                          <button 
                                            type="button"
                                            onClick={() => handleDelete(course.id)}
                                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-650 font-black rounded-lg text-[10px] transition-all cursor-pointer border border-red-150"
                                          >
                                            Xóa 🗑️
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </main>
                        
                        {/* BOTTOM ROW WIDGETS (3 CARDS) */}
                        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 text-left">
                          {/* Card 1: Enrollment Trends */}
                          <div className="bg-indigo-50/40 border border-indigo-150 p-5 rounded-2xl flex flex-col justify-between shadow-sm relative h-48 overflow-hidden">
                            <div className="absolute right-0 bottom-0 opacity-10 font-bold text-8xl pr-2 select-none">📈</div>
                            <div>
                              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Enrollment Trends</h4>
                              <h3 className="text-2xl font-black text-indigo-900 mt-4">+24% this quarter</h3>
                              <p className="text-[10px] text-slate-400 font-semibold mt-1">Net positive signups across IELTS portals.</p>
                            </div>
                            <div className="h-6 w-full bg-indigo-100 rounded-lg animate-pulse"></div>
                          </div>

                          {/* Card 2: Top Teacher Ratings */}
                          <div className="bg-white border border-slate-150 p-5 rounded-2xl flex flex-col justify-between shadow-sm h-48">
                            <div>
                              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">Top Teacher Ratings</h4>
                              <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                                  <span>Dr. Sarah Jenkins</span>
                                  <span className="text-amber-500 font-bold">⭐⭐⭐⭐⭐</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-semibold text-slate-700 border-t border-slate-50 pt-1">
                                  <span>Prof. Robert Chen</span>
                                  <span className="text-amber-500 font-bold">⭐⭐⭐⭐⭐</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-semibold text-slate-700 border-t border-slate-50 pt-1">
                                  <span>Emma Thompson</span>
                                  <span className="text-amber-500 font-bold">⭐⭐⭐⭐⭐</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Card 3: Quarterly Review */}
                          <div className="bg-gradient-to-br from-slate-850 to-slate-950 text-white p-5 rounded-2xl shadow-md flex flex-col justify-between h-48 border border-slate-900">
                            <div>
                              <h4 className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Quarterly Review</h4>
                              <p className="text-xs text-slate-200 mt-3 font-semibold leading-relaxed">Strategic planning for the upcoming Fall Semester starts next week.</p>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => alert("✨ Đang mở lịch trình họp lập kế hoạch...")} 
                              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl border-none cursor-pointer transition-all text-center shadow shadow-emerald-600/10"
                            >
                              View Schedule
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                    {adminTab === 'registrations' && <RegistrationManager />}
                    {adminTab === 'classrooms' && <ClassroomManager initialSubTab="list" />}
                    {adminTab === 'billing' && <ClassroomManager initialSubTab="tuition" />}
                    {adminTab === 'settings-payment' && <ClassroomManager initialSubTab="paymentConfig" />}
                    {adminTab === 'accounts' && <AdminAccountsManager />}
                    {adminTab === 'blogs' && <AdminBlogManager />}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        {portalMode !== 'dashboard' && (
          <footer className="bg-emerald-950 text-slate-400 py-16 px-6 border-t border-emerald-900 text-xs sm:text-sm relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 text-left relative z-10">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2.5">
                  <img src={logo} alt="EduEnglish Logo" className="w-9 h-9 object-contain rounded-xl shadow-md" />
                  <span className="text-lg font-black text-white tracking-tight">EduEnglish</span>
                </div>
                <p className="text-[11px] leading-relaxed font-semibold">
                  Hệ thống Quản lý và Đào tạo Anh ngữ chuẩn quốc tế. Cung cấp các lộ trình IELTS học thuật và tiếng Anh giao tiếp.
                </p>
                <div className="space-y-2 mt-2 text-[11px] font-bold">
                  <div className="flex items-center gap-2"><span className="text-emerald-400">&#128222;</span><span>Hotline: 0988-888-888</span></div>
                  <div className="flex items-center gap-2"><span className="text-emerald-400">&#128205;</span><span>Cơ sở: Đại học EIU, TP. Mới Bình Dương</span></div>
                  <div className="flex items-center gap-2"><span className="text-emerald-400">&#9993;</span><span>Email: contact@eduen.edu.vn</span></div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <h5 className="font-extrabold text-white uppercase text-[10px] tracking-widest mb-2 pb-1 border-b border-emerald-900 w-24">KHÁM PHÁ</h5>
                <a href="#courses" onClick={(e) => { e.preventDefault(); setPortalMode('student'); window.history.pushState({}, '', '/'); setShowProfile(false); }} className="hover:text-emerald-400 hover:pl-1 transition-all font-semibold">Chương trình học</a>
                <a href="#teachers" onClick={(e) => { e.preventDefault(); setPortalMode('teacher-team'); window.history.pushState({}, '', '/teachers'); setShowProfile(false); }} className="hover:text-emerald-400 hover:pl-1 transition-all font-semibold">Đội ngũ giảng viên</a>
                <a href="#materials" onClick={(e) => { e.preventDefault(); setPortalMode('free-materials'); window.history.pushState({}, '', '/materials'); setShowProfile(false); }} className="hover:text-emerald-400 hover:pl-1 transition-all font-semibold">Tài liệu học tập</a>
                <a href="#blog" onClick={(e) => { e.preventDefault(); setPortalMode('blog'); window.history.pushState({}, '', '/blog'); setShowProfile(false); }} className="hover:text-emerald-400 hover:pl-1 transition-all font-semibold">Tin tức &amp; Chia sẻ</a>
                <a href="#tuition" onClick={(e) => { e.preventDefault(); setPortalMode('tuition-payment-checkout'); setShowProfile(false); }} className="hover:text-emerald-400 hover:pl-1 transition-all font-semibold">Thanh toán học phí</a>
              </div>

              <div className="flex flex-col gap-3">
                <h5 className="font-extrabold text-white uppercase text-[10px] tracking-widest mb-2 pb-1 border-b border-emerald-900 w-24">TƯƠNG TÁC</h5>
                <a href="#bot" onClick={(e) => { e.preventDefault(); setPortalMode('bot'); setShowProfile(false); }} className="hover:text-emerald-400 hover:pl-1 transition-all font-semibold">Trợ lý ảo EduBot</a>
                <a href="#test" onClick={(e) => { e.preventDefault(); alert('Hệ thống thi thử đang được đồng bộ...'); }} className="hover:text-emerald-400 hover:pl-1 transition-all font-semibold">Thi thử miễn phí</a>
                <a href="#consult" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-emerald-400 hover:pl-1 transition-all font-semibold">Đăng ký tư vấn nhanh</a>
              </div>

              <div className="flex flex-col gap-3 text-left">
                <h5 className="font-extrabold text-white uppercase text-[10px] tracking-widest mb-2 pb-1 border-b border-emerald-900 w-24">PHÁP LÝ</h5>
                <a href="#privacy" className="hover:text-emerald-400 transition-all font-semibold">Chính sách bảo mật</a>
                <a href="#terms" className="hover:text-emerald-400 transition-all font-semibold">Điều khoản dịch vụ</a>
                <div className="mt-4 p-3 bg-slate-900 rounded-2xl border border-slate-800 flex items-center gap-3 w-fit">
                  <div className="w-8 h-8 bg-red-600 text-white font-black rounded-lg flex items-center justify-center text-[10px] tracking-tighter border border-red-500 shrink-0">DMCA</div>
                  <div className="text-[10px] leading-tight">
                    <p className="font-black text-slate-200">PROTECTED</p>
                    <p className="text-slate-500 mt-0.5">Bản quyền đã bảo hộ</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-6xl mx-auto border-t border-emerald-900 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-500 font-bold gap-4">
              <div>&#169; 2026 EduEnglish English Center System. All rights reserved.</div>
              <div className="flex gap-4">
                <span>Mã bảo mật: 256-SSL-SECURED</span>
                <span>&#183;</span>
                <span>Phiên bản v2.4</span>
              </div>
            </div>
          </footer>
        )}
      </div>

      {/* TESTING ROLE SWITCHER WIDGET */}
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
          className="flex items-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-2xl border border-emerald-500/20 hover:scale-105 transition-all duration-200 font-bold text-xs select-none cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Bảng Thử Nghiệm (Role Switcher)</span>
        </button>

        {showRoleSwitcher && (
          <div className="absolute bottom-16 right-0 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 animate-fade-in text-left">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">
              ⚡ Chọn vai trò kiểm thử
            </h4>
            <div className="space-y-1.5">
              <button 
                onClick={() => switchTestingRole('GUEST')}
                className={`w-full py-2 px-3 text-xs font-bold rounded-xl text-left transition-all flex items-center justify-between cursor-pointer ${
                  !currentUser 
                    ? 'bg-slate-100 text-slate-900 border border-slate-200' 
                    : 'text-slate-655 hover:bg-slate-50'
                }`}
              >
                <span>Guest</span>
                {!currentUser && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
              </button>
              
              <button 
                onClick={() => switchTestingRole('STUDENT')}
                className={`w-full py-2 px-3 text-xs font-bold rounded-xl text-left transition-all flex items-center justify-between cursor-pointer ${
                  currentUser?.role === 'STUDENT' 
                    ? 'bg-slate-100 text-slate-900 border border-slate-200' 
                    : 'text-slate-655 hover:bg-slate-50'
                }`}
              >
                <span>Học viên (Student)</span>
                {currentUser?.role === 'STUDENT' && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
              </button>

              <button 
                onClick={() => switchTestingRole('TEACHER')}
                className={`w-full py-2 px-3 text-xs font-bold rounded-xl text-left transition-all flex items-center justify-between cursor-pointer ${
                  currentUser?.role === 'TEACHER' 
                    ? 'bg-slate-100 text-slate-900 border border-slate-200' 
                    : 'text-slate-655 hover:bg-slate-50'
                }`}
              >
                <span>Giáo viên (Teacher)</span>
                {currentUser?.role === 'TEACHER' && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
              </button>

              <button 
                onClick={() => switchTestingRole('ADMIN')}
                className={`w-full py-2 px-3 text-xs font-bold rounded-xl text-left transition-all flex items-center justify-between cursor-pointer ${
                  currentUser?.role === 'ADMIN' 
                    ? 'bg-slate-100 text-slate-900 border border-slate-200' 
                    : 'text-slate-655 hover:bg-slate-50'
                }`}
              >
                <span>Quản trị viên (Admin)</span>
                {currentUser?.role === 'ADMIN' && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
              </button>
            </div>
            <p className="text-[9px] text-slate-400 font-semibold mt-3 italic leading-snug">
              * Tự động đăng nhập bằng tài khoản mẫu tương ứng và chuyển đổi giao diện lập tức.
            </p>
          </div>
        )}
      </div>

      {/* PERSISTENT FLOATING CHATBOT AT BOTTOM-LEFT */}
      <Chatbot />

      {/* AUTH PORTAL DIALOG */}
      {showAuthModal && (
        <AuthPortal 
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
}

export default App;
