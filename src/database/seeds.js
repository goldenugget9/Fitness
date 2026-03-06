// Seed exercise data — covers the major compound and isolation movements
// muscle_groups and equipment are comma-separated strings (stored as TEXT in SQLite)

export const SEED_EXERCISES = [
  // ── CHEST ────────────────────────────────────────────────────────────────────
  {
    name: 'Barbell Bench Press',
    muscle_groups: 'Chest,Triceps,Front Delts',
    equipment: 'Barbell,Bench',
    category: 'Chest',
    instructions: 'Lie flat, grip bar slightly wider than shoulder-width. Lower bar to mid-chest, press back up explosively.',
  },
  {
    name: 'Incline Dumbbell Press',
    muscle_groups: 'Upper Chest,Triceps,Front Delts',
    equipment: 'Dumbbells,Bench',
    category: 'Chest',
    instructions: 'Set bench to 30–45°. Press dumbbells from shoulder height until arms are extended.',
  },
  {
    name: 'Cable Chest Fly',
    muscle_groups: 'Chest',
    equipment: 'Cable Machine',
    category: 'Chest',
    instructions: 'Stand centered between pulleys set at chest height. Bring handles together in an arc, squeezing chest at the peak.',
  },
  {
    name: 'Push-Up',
    muscle_groups: 'Chest,Triceps,Front Delts',
    equipment: 'Bodyweight',
    category: 'Chest',
    instructions: 'Keep core tight, lower chest to floor, push back up. Keep elbows at ~45° from torso.',
  },
  {
    name: 'Dumbbell Pullover',
    muscle_groups: 'Chest,Lats,Serratus',
    equipment: 'Dumbbell,Bench',
    category: 'Chest',
    instructions: 'Lie across bench. Hold dumbbell overhead with both hands, lower behind head, then pull back.',
  },

  // ── BACK ─────────────────────────────────────────────────────────────────────
  {
    name: 'Barbell Deadlift',
    muscle_groups: 'Lower Back,Glutes,Hamstrings,Traps',
    equipment: 'Barbell',
    category: 'Back',
    instructions: 'Hinge at hips, neutral spine. Drive through heels to lockout, squeeze glutes at top.',
  },
  {
    name: 'Pull-Up',
    muscle_groups: 'Lats,Biceps,Rear Delts',
    equipment: 'Pull-Up Bar',
    category: 'Back',
    instructions: 'Hang from bar, pull elbows to hips until chin clears bar. Lower with control.',
  },
  {
    name: 'Barbell Row',
    muscle_groups: 'Lats,Rhomboids,Biceps,Lower Back',
    equipment: 'Barbell',
    category: 'Back',
    instructions: 'Hinge to ~45°. Pull bar into lower chest/upper abdomen, squeezing shoulder blades at the top.',
  },
  {
    name: 'Seated Cable Row',
    muscle_groups: 'Lats,Rhomboids,Biceps',
    equipment: 'Cable Machine',
    category: 'Back',
    instructions: 'Sit upright, pull handle to abdomen, drive elbows back, squeeze at the end of the rep.',
  },
  {
    name: 'Lat Pulldown',
    muscle_groups: 'Lats,Biceps,Rear Delts',
    equipment: 'Cable Machine',
    category: 'Back',
    instructions: 'Pull bar to upper chest, leaning slightly back. Control the return.',
  },
  {
    name: 'Single-Arm Dumbbell Row',
    muscle_groups: 'Lats,Rhomboids,Rear Delts,Biceps',
    equipment: 'Dumbbell,Bench',
    category: 'Back',
    instructions: 'Brace on bench. Row dumbbell to hip, elbow close to body.',
  },

  // ── SHOULDERS ────────────────────────────────────────────────────────────────
  {
    name: 'Overhead Press (Barbell)',
    muscle_groups: 'Front Delts,Lateral Delts,Triceps',
    equipment: 'Barbell',
    category: 'Shoulders',
    instructions: 'Press bar from front-rack to lockout overhead. Keep core braced.',
  },
  {
    name: 'Dumbbell Lateral Raise',
    muscle_groups: 'Lateral Delts',
    equipment: 'Dumbbells',
    category: 'Shoulders',
    instructions: 'Raise dumbbells to the side to shoulder height with a slight forward lean. Control the descent.',
  },
  {
    name: 'Face Pull',
    muscle_groups: 'Rear Delts,Rotator Cuff,Traps',
    equipment: 'Cable Machine',
    category: 'Shoulders',
    instructions: 'Set pulley at face height. Pull rope to face, flare elbows out and back.',
  },
  {
    name: 'Arnold Press',
    muscle_groups: 'Front Delts,Lateral Delts,Triceps',
    equipment: 'Dumbbells',
    category: 'Shoulders',
    instructions: 'Start with palms facing you, rotate outward as you press overhead.',
  },

  // ── LEGS ─────────────────────────────────────────────────────────────────────
  {
    name: 'Barbell Back Squat',
    muscle_groups: 'Quads,Glutes,Hamstrings,Core',
    equipment: 'Barbell,Squat Rack',
    category: 'Legs',
    instructions: 'Bar on traps, feet shoulder-width. Squat to parallel or below, drive up through heels.',
  },
  {
    name: 'Romanian Deadlift',
    muscle_groups: 'Hamstrings,Glutes,Lower Back',
    equipment: 'Barbell',
    category: 'Legs',
    instructions: 'Push hips back, lower bar along legs with soft knees. Feel stretch in hamstrings, then drive hips forward.',
  },
  {
    name: 'Leg Press',
    muscle_groups: 'Quads,Glutes,Hamstrings',
    equipment: 'Leg Press Machine',
    category: 'Legs',
    instructions: 'Place feet shoulder-width on platform. Press through heels. Don\'t lock knees at the top.',
  },
  {
    name: 'Bulgarian Split Squat',
    muscle_groups: 'Quads,Glutes,Hamstrings',
    equipment: 'Dumbbells,Bench',
    category: 'Legs',
    instructions: 'Rear foot elevated on bench. Lower until front thigh is parallel, drive back up.',
  },
  {
    name: 'Leg Curl (Lying)',
    muscle_groups: 'Hamstrings',
    equipment: 'Leg Curl Machine',
    category: 'Legs',
    instructions: 'Curl legs toward glutes through full range of motion. Squeeze at the top.',
  },
  {
    name: 'Leg Extension',
    muscle_groups: 'Quads',
    equipment: 'Leg Extension Machine',
    category: 'Legs',
    instructions: 'Extend legs to full lockout, squeezing quads. Control the descent.',
  },
  {
    name: 'Standing Calf Raise',
    muscle_groups: 'Calves',
    equipment: 'Calf Raise Machine,Bodyweight',
    category: 'Legs',
    instructions: 'Rise onto toes through full ROM. Pause at top, lower heel below platform for full stretch.',
  },
  {
    name: 'Hip Thrust (Barbell)',
    muscle_groups: 'Glutes,Hamstrings',
    equipment: 'Barbell,Bench',
    category: 'Legs',
    instructions: 'Shoulders on bench, bar across hips. Drive hips to ceiling, squeeze glutes at the top.',
  },

  // ── ARMS ─────────────────────────────────────────────────────────────────────
  {
    name: 'Barbell Curl',
    muscle_groups: 'Biceps',
    equipment: 'Barbell',
    category: 'Arms',
    instructions: 'Keep elbows at sides. Curl bar to shoulders, squeeze biceps, lower with control.',
  },
  {
    name: 'Hammer Curl',
    muscle_groups: 'Biceps,Brachialis',
    equipment: 'Dumbbells',
    category: 'Arms',
    instructions: 'Neutral grip (palms facing each other). Curl dumbbells alternately or together.',
  },
  {
    name: 'Tricep Pushdown (Cable)',
    muscle_groups: 'Triceps',
    equipment: 'Cable Machine',
    category: 'Arms',
    instructions: 'Elbows locked at sides. Push bar or rope down to full extension, squeeze triceps.',
  },
  {
    name: 'Overhead Tricep Extension (Dumbbell)',
    muscle_groups: 'Triceps (Long Head)',
    equipment: 'Dumbbell',
    category: 'Arms',
    instructions: 'Hold dumbbell overhead with both hands. Lower behind head, extend back up.',
  },
  {
    name: 'Preacher Curl',
    muscle_groups: 'Biceps (Short Head)',
    equipment: 'EZ Bar,Preacher Bench',
    category: 'Arms',
    instructions: 'Arms on pad. Curl bar to chin. Lower slowly — don\'t hyperextend at the bottom.',
  },

  // ── CORE ─────────────────────────────────────────────────────────────────────
  {
    name: 'Plank',
    muscle_groups: 'Core,Shoulders',
    equipment: 'Bodyweight',
    category: 'Core',
    instructions: 'Forearms and toes. Neutral spine, squeeze glutes and abs. Hold for time.',
  },
  {
    name: 'Cable Crunch',
    muscle_groups: 'Core (Abs)',
    equipment: 'Cable Machine',
    category: 'Core',
    instructions: 'Kneel facing cable, rope behind head. Crunch down, rounding upper back, chin to chest.',
  },
  {
    name: 'Hanging Leg Raise',
    muscle_groups: 'Core,Hip Flexors',
    equipment: 'Pull-Up Bar',
    category: 'Core',
    instructions: 'Hang from bar. Raise legs to 90° (or higher), lower with control. Avoid swinging.',
  },
  {
    name: 'Ab Wheel Rollout',
    muscle_groups: 'Core,Lats',
    equipment: 'Ab Wheel',
    category: 'Core',
    instructions: 'Kneel, roll wheel forward until body is near horizontal, pull back using core.',
  },
];
