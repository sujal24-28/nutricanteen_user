export const SCHOOLS_LIST = [
  {
    id: 'dps-rkp',
    name: 'Delhi Public School (DPS RK Puram)',
    code: 'DPS-RKP',
    city: 'New Delhi',
    badgeColor: '#15803d'
  },
  {
    id: 'st-xaviers',
    name: "St. Xavier's Senior Secondary School",
    code: 'STX-LKO',
    city: 'Lucknow',
    badgeColor: '#166534'
  },
  {
    id: 'lotus-valley',
    name: 'Lotus Valley International School',
    code: 'LVIS-NOI',
    city: 'Noida',
    badgeColor: '#047857'
  },
  {
    id: 'greenwood-high',
    name: 'Greenwood High International School',
    code: 'GWH-BLR',
    city: 'Bengaluru',
    badgeColor: '#15803d'
  },
  {
    id: 'dav-public',
    name: 'DAV Public School',
    code: 'DAV-SEC14',
    city: 'Gurugram',
    badgeColor: '#166534'
  },
  {
    id: 'modern-school',
    name: 'The Modern Academy',
    code: 'MOD-DEL',
    city: 'New Delhi',
    badgeColor: '#065f46'
  }
];

export const CLASSES_LIST = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 
  'Class 5', 'Class 6', 'Class 7', 'Class 8', 
  'Class 9', 'Class 10', 'Class 11', 'Class 12'
];

export const SECTIONS_LIST = ['A', 'B', 'C', 'D', 'E'];

// Sample registry of students across classes for the Canteen Counter Admin lookup
export const SAMPLE_STUDENTS_REGISTRY = [
  {
    uniqueId: 'STU-10B-24',
    phone: '9628342206',
    name: 'Sujal Kumar',
    schoolId: 'dps-rkp',
    schoolName: 'Delhi Public School (DPS RK Puram)',
    className: 'Class 10',
    section: 'B',
    rollNo: '24',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    walletBalance: 480,
    parentContact: '+91 98765 43210'
  },
  {
    uniqueId: 'STU-9A-12',
    phone: '9876543211',
    name: 'Aarav Sharma',
    schoolId: 'dps-rkp',
    schoolName: 'Delhi Public School (DPS RK Puram)',
    className: 'Class 9',
    section: 'A',
    rollNo: '12',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    walletBalance: 250,
    parentContact: '+91 98765 11111'
  },
  {
    uniqueId: 'STU-8C-35',
    phone: '9876543212',
    name: 'Ananya Verma',
    schoolId: 'st-xaviers',
    schoolName: "St. Xavier's Senior Secondary School",
    className: 'Class 8',
    section: 'C',
    rollNo: '35',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    walletBalance: 610,
    parentContact: '+91 98765 22222'
  },
  {
    uniqueId: 'STU-11B-07',
    phone: '9876543213',
    name: 'Rohan Mehra',
    schoolId: 'lotus-valley',
    schoolName: 'Lotus Valley International School',
    className: 'Class 11',
    section: 'B',
    rollNo: '07',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    walletBalance: 120,
    parentContact: '+91 98765 33333'
  }
];
