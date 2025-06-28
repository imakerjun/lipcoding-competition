import Joi from 'joi';

// 비밀번호 강도 검증 패턴
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

// 공통 스키마 요소들
const emailSchema = Joi.string()
  .email({ minDomainSegments: 2 })
  .lowercase()
  .trim()
  .required()
  .messages({
    'string.email': 'Valid email address is required',
    'any.required': 'Email is required'
  });

const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(passwordPattern)
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password must not exceed 128 characters',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    'any.required': 'Password is required'
  });

const nameSchema = Joi.string()
  .min(1)
  .max(100)
  .trim()
  .required()
  .messages({
    'string.empty': 'Name cannot be empty',
    'string.min': 'Name must be at least 1 character long',
    'string.max': 'Name must not exceed 100 characters',
    'any.required': 'Name is required'
  });

const roleSchema = Joi.string()
  .valid('mentor', 'mentee')
  .required()
  .messages({
    'any.only': 'Role must be either "mentor" or "mentee"',
    'any.required': 'Role is required'
  });

// 회원가입 스키마
export const SignupSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  role: roleSchema
}).options({
  stripUnknown: true, // 알려지지 않은 필드 제거
  abortEarly: false   // 모든 검증 오류 수집
});

// 로그인 스키마
export const LoginSchema = Joi.object({
  email: emailSchema,
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required',
      'string.empty': 'Password cannot be empty'
    })
}).options({
  stripUnknown: true,
  abortEarly: false
});

// 프로필 업데이트 스키마
export const UpdateProfileSchema = Joi.object({
  name: nameSchema.optional(),
  bio: Joi.string()
    .max(500)
    .trim()
    .allow('')
    .optional()
    .messages({
      'string.max': 'Bio must not exceed 500 characters'
    }),
  skills: Joi.array()
    .items(
      Joi.string()
        .min(1)
        .max(50)
        .trim()
        .messages({
          'string.min': 'Skill name must be at least 1 character long',
          'string.max': 'Skill name must not exceed 50 characters'
        })
    )
    .max(20)
    .optional()
    .messages({
      'array.max': 'Cannot have more than 20 skills'
    })
}).options({
  stripUnknown: true,
  abortEarly: false
});

// 매칭 요청 스키마
export const MatchRequestSchema = Joi.object({
  mentorId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Mentor ID must be a number',
      'number.integer': 'Mentor ID must be an integer',
      'number.positive': 'Mentor ID must be positive',
      'any.required': 'Mentor ID is required'
    }),
  message: Joi.string()
    .min(10)
    .max(1000)
    .trim()
    .required()
    .messages({
      'string.min': 'Message must be at least 10 characters long',
      'string.max': 'Message must not exceed 1000 characters',
      'any.required': 'Message is required'
    })
}).options({
  stripUnknown: true,
  abortEarly: false
});

// 스키마 타입 추출
export type SignupData = {
  email: string;
  password: string;
  name: string;
  role: 'mentor' | 'mentee';
};

export type LoginData = {
  email: string;
  password: string;
};

export type UpdateProfileData = {
  name?: string;
  bio?: string;
  skills?: string[];
};

export type MatchRequestData = {
  mentorId: number;
  message: string;
};
