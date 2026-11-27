export const languages = ['en', 'ru'] as const
export type Language = (typeof languages)[number]

const en = {
  'app.name': 'ImageCompressor',
  'app.tagline': 'Make images lighter without changing their format',

  'nav.compress': 'Compress',
  'nav.login': 'Log in',
  'nav.register': 'Sign up',
  'nav.logout': 'Log out',
  'language.label': 'Language',

  'common.loading': 'Loading…',

  'auth.login.title': 'Log in',
  'auth.login.subtitle': 'Welcome back! Log in to compress your images.',
  'auth.login.submit': 'Log in',
  'auth.login.switch': "Don't have an account?",
  'auth.login.switchLink': 'Sign up',
  'auth.register.title': 'Create account',
  'auth.register.subtitle': 'Sign up to compress images and keep your history.',
  'auth.register.submit': 'Sign up',
  'auth.register.switch': 'Already have an account?',
  'auth.register.switchLink': 'Log in',
  'auth.submitting': 'Please wait…',
  'auth.username': 'Username',
  'auth.username.placeholder': 'Enter your username',
  'auth.password': 'Password',
  'auth.password.placeholder': 'Enter your password',
  'auth.confirmPassword': 'Confirm password',
  'auth.confirmPassword.placeholder': 'Repeat your password',

  'validation.required': 'Please fill in all fields',
  'validation.passwordsMismatch': 'Passwords do not match',

  'errors.invalidCredentials': 'Invalid username or password',
  'errors.usernameTaken': 'This username is already taken',
  'errors.network': 'Unable to reach the server. Check your connection and try again.',
  'errors.unknown': 'Something went wrong. Please try again.',

  'upload.title': 'Compress an image',
  'upload.drop': 'Drag & drop an image here',
  'upload.or': 'or',
  'upload.choose': 'Choose file',
  'upload.change': 'Choose another',
  'upload.remove': 'Remove',
  'upload.preview': 'Preview',
  'upload.formats': 'JPEG, PNG, WebP, GIF, BMP, TIFF. The original format is kept.',
  'upload.quality': 'Quality',
  'upload.qualityHint': 'Lower quality means a smaller file. For PNG and GIF it reduces the number of colors.',
  'upload.submit': 'Compress',
  'upload.submitting': 'Compressing…',
  'upload.invalidType': 'Please select an image file',
  'upload.unsupported': 'This file could not be read as an image. Try another one.',

  'result.title': 'Done!',
  'result.original': 'Original',
  'result.compressed': 'Compressed',
  'result.saved': 'Saved {percent}',
  'result.notSmaller': 'The image is already well optimized, so its size stayed the same.',
  'result.download': 'Download',

  'compare.label': 'Comparison divider: original on the left, compressed on the right',
  'compare.valueText': 'Original shown on {percent}% of the width',
  'compare.hint': 'Drag the divider to compare',

  'history.title': 'Upload history',
  'history.empty': 'No compressed images yet. Your results will appear here.',
  'history.loadError': 'Failed to load history',
  'history.retry': 'Retry',
  'history.quality': 'Quality {quality}',
  'history.untitled': 'Untitled image',
  'history.open': 'Open {name}',

  'viewer.close': 'Close',
  'viewer.previous': 'Previous image',
  'viewer.next': 'Next image',
  'viewer.counter': '{current} of {total}',
  'viewer.loadError': 'Failed to load the image',

  'units.b': 'B',
  'units.kb': 'KB',
  'units.mb': 'MB',
  'units.gb': 'GB',
}

export type TranslationKey = keyof typeof en

const ru: Record<TranslationKey, string> = {
  'app.name': 'ImageCompressor',
  'app.tagline': 'Уменьшайте вес изображений без смены формата',

  'nav.compress': 'Сжать',
  'nav.login': 'Войти',
  'nav.register': 'Регистрация',
  'nav.logout': 'Выйти',
  'language.label': 'Язык',

  'common.loading': 'Загрузка…',

  'auth.login.title': 'Вход',
  'auth.login.subtitle': 'С возвращением! Войдите, чтобы сжимать изображения.',
  'auth.login.submit': 'Войти',
  'auth.login.switch': 'Нет аккаунта?',
  'auth.login.switchLink': 'Зарегистрироваться',
  'auth.register.title': 'Регистрация',
  'auth.register.subtitle': 'Создайте аккаунт, чтобы сжимать изображения и хранить историю.',
  'auth.register.submit': 'Зарегистрироваться',
  'auth.register.switch': 'Уже есть аккаунт?',
  'auth.register.switchLink': 'Войти',
  'auth.submitting': 'Подождите…',
  'auth.username': 'Имя пользователя',
  'auth.username.placeholder': 'Введите имя пользователя',
  'auth.password': 'Пароль',
  'auth.password.placeholder': 'Введите пароль',
  'auth.confirmPassword': 'Подтверждение пароля',
  'auth.confirmPassword.placeholder': 'Повторите пароль',

  'validation.required': 'Заполните все поля',
  'validation.passwordsMismatch': 'Пароли не совпадают',

  'errors.invalidCredentials': 'Неверное имя пользователя или пароль',
  'errors.usernameTaken': 'Это имя пользователя уже занято',
  'errors.network': 'Не удалось связаться с сервером. Проверьте подключение и попробуйте снова.',
  'errors.unknown': 'Что-то пошло не так. Попробуйте ещё раз.',

  'upload.title': 'Сжать изображение',
  'upload.drop': 'Перетащите изображение сюда',
  'upload.or': 'или',
  'upload.choose': 'Выбрать файл',
  'upload.change': 'Выбрать другой',
  'upload.remove': 'Убрать',
  'upload.preview': 'Предпросмотр',
  'upload.formats': 'JPEG, PNG, WebP, GIF, BMP, TIFF. Исходный формат сохраняется.',
  'upload.quality': 'Качество',
  'upload.qualityHint': 'Чем ниже качество, тем меньше файл. Для PNG и GIF уменьшается количество цветов.',
  'upload.submit': 'Сжать',
  'upload.submitting': 'Сжимаем…',
  'upload.invalidType': 'Выберите файл изображения',
  'upload.unsupported': 'Не удалось прочитать файл как изображение. Попробуйте другой.',

  'result.title': 'Готово!',
  'result.original': 'Оригинал',
  'result.compressed': 'Сжатое',
  'result.saved': 'Экономия {percent}',
  'result.notSmaller': 'Изображение уже хорошо оптимизировано, поэтому размер не изменился.',
  'result.download': 'Скачать',

  'compare.label': 'Разделитель сравнения: слева оригинал, справа сжатое',
  'compare.valueText': 'Оригинал занимает {percent}% ширины',
  'compare.hint': 'Перетащите разделитель, чтобы сравнить',

  'history.title': 'История загрузок',
  'history.empty': 'Пока нет сжатых изображений. Здесь появятся ваши результаты.',
  'history.loadError': 'Не удалось загрузить историю',
  'history.retry': 'Повторить',
  'history.quality': 'Качество {quality}',
  'history.untitled': 'Без названия',
  'history.open': 'Открыть {name}',

  'viewer.close': 'Закрыть',
  'viewer.previous': 'Предыдущее изображение',
  'viewer.next': 'Следующее изображение',
  'viewer.counter': '{current} из {total}',
  'viewer.loadError': 'Не удалось загрузить изображение',

  'units.b': 'Б',
  'units.kb': 'КБ',
  'units.mb': 'МБ',
  'units.gb': 'ГБ',
}

export const translations: Record<Language, Record<TranslationKey, string>> = { en, ru }
