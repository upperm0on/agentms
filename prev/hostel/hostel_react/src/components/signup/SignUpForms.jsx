import "../../assets/css/signup/SignUpForms.css";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { buildApiUrl, API_ENDPOINTS } from "../../config/api";
import { Eye, EyeOff, User, Mail, Lock, UserCheck, Phone, Users } from "lucide-react";
import { setEmailSafely } from "../../utils/authUtils";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../store/slices/authSlice";

// Country codes dictionary - comprehensive list of international dialing codes with flags
const COUNTRY_CODES = {
  // Africa
  '20': { name: 'Egypt', flag: '🇪🇬' },
  '27': { name: 'South Africa', flag: '🇿🇦' },
  '212': { name: 'Morocco', flag: '🇲🇦' },
  '213': { name: 'Algeria', flag: '🇩🇿' },
  '216': { name: 'Tunisia', flag: '🇹🇳' },
  '218': { name: 'Libya', flag: '🇱🇾' },
  '220': { name: 'Gambia', flag: '🇬🇲' },
  '221': { name: 'Senegal', flag: '🇸🇳' },
  '222': { name: 'Mauritania', flag: '🇲🇷' },
  '223': { name: 'Mali', flag: '🇲🇱' },
  '224': { name: 'Guinea', flag: '🇬🇳' },
  '225': { name: 'Ivory Coast', flag: '🇨🇮' },
  '226': { name: 'Burkina Faso', flag: '🇧🇫' },
  '227': { name: 'Niger', flag: '🇳🇪' },
  '228': { name: 'Togo', flag: '🇹🇬' },
  '229': { name: 'Benin', flag: '🇧🇯' },
  '230': { name: 'Mauritius', flag: '🇲🇺' },
  '231': { name: 'Liberia', flag: '🇱🇷' },
  '232': { name: 'Sierra Leone', flag: '🇸🇱' },
  '233': { name: 'Ghana', flag: '🇬🇭' },
  '234': { name: 'Nigeria', flag: '🇳🇬' },
  '235': { name: 'Chad', flag: '🇹🇩' },
  '236': { name: 'Central African Republic', flag: '🇨🇫' },
  '237': { name: 'Cameroon', flag: '🇨🇲' },
  '238': { name: 'Cape Verde', flag: '🇨🇻' },
  '239': { name: 'São Tomé and Príncipe', flag: '🇸🇹' },
  '240': { name: 'Equatorial Guinea', flag: '🇬🇶' },
  '241': { name: 'Gabon', flag: '🇬🇦' },
  '242': { name: 'Republic of the Congo', flag: '🇨🇬' },
  '243': { name: 'Democratic Republic of the Congo', flag: '🇨🇩' },
  '244': { name: 'Angola', flag: '🇦🇴' },
  '245': { name: 'Guinea-Bissau', flag: '🇬🇼' },
  '246': { name: 'British Indian Ocean Territory', flag: '🇮🇴' },
  '247': { name: 'Ascension Island', flag: '🇦🇨' },
  '248': { name: 'Seychelles', flag: '🇸🇨' },
  '249': { name: 'Sudan', flag: '🇸🇩' },
  '250': { name: 'Rwanda', flag: '🇷🇼' },
  '251': { name: 'Ethiopia', flag: '🇪🇹' },
  '252': { name: 'Somalia', flag: '🇸🇴' },
  '253': { name: 'Djibouti', flag: '🇩🇯' },
  '254': { name: 'Kenya', flag: '🇰🇪' },
  '255': { name: 'Tanzania', flag: '🇹🇿' },
  '256': { name: 'Uganda', flag: '🇺🇬' },
  '257': { name: 'Burundi', flag: '🇧🇮' },
  '258': { name: 'Mozambique', flag: '🇲🇿' },
  '260': { name: 'Zambia', flag: '🇿🇲' },
  '261': { name: 'Madagascar', flag: '🇲🇬' },
  '262': { name: 'Réunion', flag: '🇷🇪' },
  '263': { name: 'Zimbabwe', flag: '🇿🇼' },
  '264': { name: 'Namibia', flag: '🇳🇦' },
  '265': { name: 'Malawi', flag: '🇲🇼' },
  '266': { name: 'Lesotho', flag: '🇱🇸' },
  '267': { name: 'Botswana', flag: '🇧🇼' },
  '268': { name: 'Eswatini', flag: '🇸🇿' },
  '269': { name: 'Comoros', flag: '🇰🇲' },
  '290': { name: 'Saint Helena', flag: '🇸🇭' },
  '291': { name: 'Eritrea', flag: '🇪🇷' },
  
  // Europe
  '30': { name: 'Greece', flag: '🇬🇷' },
  '31': { name: 'Netherlands', flag: '🇳🇱' },
  '32': { name: 'Belgium', flag: '🇧🇪' },
  '33': { name: 'France', flag: '🇫🇷' },
  '34': { name: 'Spain', flag: '🇪🇸' },
  '36': { name: 'Hungary', flag: '🇭🇺' },
  '39': { name: 'Italy', flag: '🇮🇹' },
  '40': { name: 'Romania', flag: '🇷🇴' },
  '41': { name: 'Switzerland', flag: '🇨🇭' },
  '43': { name: 'Austria', flag: '🇦🇹' },
  '44': { name: 'United Kingdom', flag: '🇬🇧' },
  '45': { name: 'Denmark', flag: '🇩🇰' },
  '46': { name: 'Sweden', flag: '🇸🇪' },
  '47': { name: 'Norway', flag: '🇳🇴' },
  '48': { name: 'Poland', flag: '🇵🇱' },
  '49': { name: 'Germany', flag: '🇩🇪' },
  '350': { name: 'Gibraltar', flag: '🇬🇮' },
  '351': { name: 'Portugal', flag: '🇵🇹' },
  '352': { name: 'Luxembourg', flag: '🇱🇺' },
  '353': { name: 'Ireland', flag: '🇮🇪' },
  '354': { name: 'Iceland', flag: '🇮🇸' },
  '355': { name: 'Albania', flag: '🇦🇱' },
  '356': { name: 'Malta', flag: '🇲🇹' },
  '357': { name: 'Cyprus', flag: '🇨🇾' },
  '358': { name: 'Finland', flag: '🇫🇮' },
  '359': { name: 'Bulgaria', flag: '🇧🇬' },
  '370': { name: 'Lithuania', flag: '🇱🇹' },
  '371': { name: 'Latvia', flag: '🇱🇻' },
  '372': { name: 'Estonia', flag: '🇪🇪' },
  '373': { name: 'Moldova', flag: '🇲🇩' },
  '374': { name: 'Armenia', flag: '🇦🇲' },
  '375': { name: 'Belarus', flag: '🇧🇾' },
  '376': { name: 'Andorra', flag: '🇦🇩' },
  '377': { name: 'Monaco', flag: '🇲🇨' },
  '378': { name: 'San Marino', flag: '🇸🇲' },
  '380': { name: 'Ukraine', flag: '🇺🇦' },
  '381': { name: 'Serbia', flag: '🇷🇸' },
  '382': { name: 'Montenegro', flag: '🇲🇪' },
  '383': { name: 'Kosovo', flag: '🇽🇰' },
  '385': { name: 'Croatia', flag: '🇭🇷' },
  '386': { name: 'Slovenia', flag: '🇸🇮' },
  '387': { name: 'Bosnia and Herzegovina', flag: '🇧🇦' },
  '389': { name: 'North Macedonia', flag: '🇲🇰' },
  '420': { name: 'Czech Republic', flag: '🇨🇿' },
  '421': { name: 'Slovakia', flag: '🇸🇰' },
  '423': { name: 'Liechtenstein', flag: '🇱🇮' },
  
  // Asia
  '7': { name: 'Russia/Kazakhstan', flag: '🇷🇺' },
  '81': { name: 'Japan', flag: '🇯🇵' },
  '82': { name: 'South Korea', flag: '🇰🇷' },
  '84': { name: 'Vietnam', flag: '🇻🇳' },
  '86': { name: 'China', flag: '🇨🇳' },
  '90': { name: 'Turkey', flag: '🇹🇷' },
  '91': { name: 'India', flag: '🇮🇳' },
  '92': { name: 'Pakistan', flag: '🇵🇰' },
  '93': { name: 'Afghanistan', flag: '🇦🇫' },
  '94': { name: 'Sri Lanka', flag: '🇱🇰' },
  '95': { name: 'Myanmar', flag: '🇲🇲' },
  '98': { name: 'Iran', flag: '🇮🇷' },
  '850': { name: 'North Korea', flag: '🇰🇵' },
  '852': { name: 'Hong Kong', flag: '🇭🇰' },
  '853': { name: 'Macau', flag: '🇲🇴' },
  '855': { name: 'Cambodia', flag: '🇰🇭' },
  '856': { name: 'Laos', flag: '🇱🇦' },
  '880': { name: 'Bangladesh', flag: '🇧🇩' },
  '886': { name: 'Taiwan', flag: '🇹🇼' },
  '960': { name: 'Maldives', flag: '🇲🇻' },
  '961': { name: 'Lebanon', flag: '🇱🇧' },
  '962': { name: 'Jordan', flag: '🇯🇴' },
  '963': { name: 'Syria', flag: '🇸🇾' },
  '964': { name: 'Iraq', flag: '🇮🇶' },
  '965': { name: 'Kuwait', flag: '🇰🇼' },
  '966': { name: 'Saudi Arabia', flag: '🇸🇦' },
  '967': { name: 'Yemen', flag: '🇾🇪' },
  '968': { name: 'Oman', flag: '🇴🇲' },
  '970': { name: 'Palestine', flag: '🇵🇸' },
  '971': { name: 'United Arab Emirates', flag: '🇦🇪' },
  '972': { name: 'Israel', flag: '🇮🇱' },
  '973': { name: 'Bahrain', flag: '🇧🇭' },
  '974': { name: 'Qatar', flag: '🇶🇦' },
  '975': { name: 'Bhutan', flag: '🇧🇹' },
  '976': { name: 'Mongolia', flag: '🇲🇳' },
  '977': { name: 'Nepal', flag: '🇳🇵' },
  '992': { name: 'Tajikistan', flag: '🇹🇯' },
  '993': { name: 'Turkmenistan', flag: '🇹🇲' },
  '994': { name: 'Azerbaijan', flag: '🇦🇿' },
  '995': { name: 'Georgia', flag: '🇬🇪' },
  '996': { name: 'Kyrgyzstan', flag: '🇰🇬' },
  '998': { name: 'Uzbekistan', flag: '🇺🇿' },
  
  // Southeast Asia & Oceania
  '60': { name: 'Malaysia', flag: '🇲🇾' },
  '61': { name: 'Australia', flag: '🇦🇺' },
  '62': { name: 'Indonesia', flag: '🇮🇩' },
  '63': { name: 'Philippines', flag: '🇵🇭' },
  '64': { name: 'New Zealand', flag: '🇳🇿' },
  '65': { name: 'Singapore', flag: '🇸🇬' },
  '66': { name: 'Thailand', flag: '🇹🇭' },
  '670': { name: 'East Timor', flag: '🇹🇱' },
  '672': { name: 'Australian External Territories', flag: '🇦🇺' },
  '673': { name: 'Brunei', flag: '🇧🇳' },
  '674': { name: 'Nauru', flag: '🇳🇷' },
  '675': { name: 'Papua New Guinea', flag: '🇵🇬' },
  '676': { name: 'Tonga', flag: '🇹🇴' },
  '677': { name: 'Solomon Islands', flag: '🇸🇧' },
  '678': { name: 'Vanuatu', flag: '🇻🇺' },
  '679': { name: 'Fiji', flag: '🇫🇯' },
  '680': { name: 'Palau', flag: '🇵🇼' },
  '681': { name: 'Wallis and Futuna', flag: '🇼🇫' },
  '682': { name: 'Cook Islands', flag: '🇨🇰' },
  '683': { name: 'Niue', flag: '🇳🇺' },
  '684': { name: 'American Samoa', flag: '🇦🇸' },
  '685': { name: 'Samoa', flag: '🇼🇸' },
  '686': { name: 'Kiribati', flag: '🇰🇮' },
  '687': { name: 'New Caledonia', flag: '🇳🇨' },
  '688': { name: 'Tuvalu', flag: '🇹🇻' },
  '689': { name: 'French Polynesia', flag: '🇵🇫' },
  '690': { name: 'Tokelau', flag: '🇹🇰' },
  '691': { name: 'Micronesia', flag: '🇫🇲' },
  '692': { name: 'Marshall Islands', flag: '🇲🇭' },
  
  // Americas
  '1': { name: 'United States/Canada', flag: '🇺🇸' },
  '51': { name: 'Peru', flag: '🇵🇪' },
  '52': { name: 'Mexico', flag: '🇲🇽' },
  '53': { name: 'Cuba', flag: '🇨🇺' },
  '54': { name: 'Argentina', flag: '🇦🇷' },
  '55': { name: 'Brazil', flag: '🇧🇷' },
  '56': { name: 'Chile', flag: '🇨🇱' },
  '57': { name: 'Colombia', flag: '🇨🇴' },
  '58': { name: 'Venezuela', flag: '🇻🇪' },
  '500': { name: 'Falkland Islands', flag: '🇫🇰' },
  '501': { name: 'Belize', flag: '🇧🇿' },
  '502': { name: 'Guatemala', flag: '🇬🇹' },
  '503': { name: 'El Salvador', flag: '🇸🇻' },
  '504': { name: 'Honduras', flag: '🇭🇳' },
  '505': { name: 'Nicaragua', flag: '🇳🇮' },
  '506': { name: 'Costa Rica', flag: '🇨🇷' },
  '507': { name: 'Panama', flag: '🇵🇦' },
  '508': { name: 'Saint Pierre and Miquelon', flag: '🇵🇲' },
  '509': { name: 'Haiti', flag: '🇭🇹' },
  '590': { name: 'Guadeloupe', flag: '🇬🇵' },
  '591': { name: 'Bolivia', flag: '🇧🇴' },
  '592': { name: 'Guyana', flag: '🇬🇾' },
  '593': { name: 'Ecuador', flag: '🇪🇨' },
  '594': { name: 'French Guiana', flag: '🇬🇫' },
  '595': { name: 'Paraguay', flag: '🇵🇾' },
  '596': { name: 'Martinique', flag: '🇲🇶' },
  '597': { name: 'Suriname', flag: '🇸🇷' },
  '598': { name: 'Uruguay', flag: '🇺🇾' },
  '599': { name: 'Netherlands Antilles', flag: '🇧🇶' },
  '1242': { name: 'Bahamas', flag: '🇧🇸' },
  '1246': { name: 'Barbados', flag: '🇧🇧' },
  '1264': { name: 'Anguilla', flag: '🇦🇮' },
  '1268': { name: 'Antigua and Barbuda', flag: '🇦🇬' },
  '1284': { name: 'British Virgin Islands', flag: '🇻🇬' },
  '1340': { name: 'U.S. Virgin Islands', flag: '🇻🇮' },
  '1345': { name: 'Cayman Islands', flag: '🇰🇾' },
  '1441': { name: 'Bermuda', flag: '🇧🇲' },
  '1473': { name: 'Grenada', flag: '🇬🇩' },
  '1649': { name: 'Turks and Caicos Islands', flag: '🇹🇨' },
  '1664': { name: 'Montserrat', flag: '🇲🇸' },
  '1670': { name: 'Northern Mariana Islands', flag: '🇲🇵' },
  '1671': { name: 'Guam', flag: '🇬🇺' },
  '1684': { name: 'American Samoa', flag: '🇦🇸' },
  '1721': { name: 'Sint Maarten', flag: '🇸🇽' },
  '1758': { name: 'Saint Lucia', flag: '🇱🇨' },
  '1767': { name: 'Dominica', flag: '🇩🇲' },
  '1784': { name: 'Saint Vincent and the Grenadines', flag: '🇻🇨' },
  '1787': { name: 'Puerto Rico', flag: '🇵🇷' },
  '1809': { name: 'Dominican Republic', flag: '🇩🇴' },
  '1829': { name: 'Dominican Republic', flag: '🇩🇴' },
  '1849': { name: 'Dominican Republic', flag: '🇩🇴' },
  '1868': { name: 'Trinidad and Tobago', flag: '🇹🇹' },
  '1869': { name: 'Saint Kitts and Nevis', flag: '🇰🇳' },
  '1876': { name: 'Jamaica', flag: '🇯🇲' },
  '1939': { name: 'Puerto Rico', flag: '🇵🇷' },
  
  // Other territories
  '297': { name: 'Aruba', flag: '🇦🇼' },
  '298': { name: 'Faroe Islands', flag: '🇫🇴' },
  '299': { name: 'Greenland', flag: '🇬🇱' }
};

function SignUpForms() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    phone: ''
  });
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [countryCode, setCountryCode] = useState('');
  const [isCountryCodeEditable, setIsCountryCodeEditable] = useState(true);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Check password match when either password field changes
    if (field === 'password' || field === 'confirmPassword') {
      const newPassword = field === 'password' ? value : formData.password;
      const newConfirmPassword = field === 'confirmPassword' ? value : formData.confirmPassword;
      setPasswordsMatch(newPassword === newConfirmPassword);
    }
  };

  const formatPhoneNumber = (value) => {
    // Add spacing after country code for better readability
    if (countryCode && value.length > countryCode.length) {
      // Use the current country code length for spacing, regardless of whether it matches
      const countryPart = value.substring(0, countryCode.length);
      const numberPart = value.substring(countryCode.length);
      return `${countryPart} ${numberPart}`;
    }
    return value;
  };

  const findCountryCode = (value) => {
    // Check for country codes of different lengths (1, 2, 3, 4 digits)
    for (let length = Math.min(value.length, 4); length >= 1; length--) {
      const code = value.substring(0, length);
      if (COUNTRY_CODES[code]) {
        return { code, length };
      }
    }
    return null;
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Remove all non-numeric characters and spaces
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Find the best matching country code
    const countryMatch = findCountryCode(numericValue);
    
    if (countryMatch) {
      const { code, length } = countryMatch;
      
      // If the input exactly matches a country code, lock it
      if (numericValue.length === length) {
        setCountryCode(code);
        setIsCountryCodeEditable(false);
      } else {
        // Input is longer than the matched country code, use the matched country code for spacing
        setCountryCode(code);
        setIsCountryCodeEditable(true);
      }
    } else {
      // No country code found, find the longest partial match for spacing
      let longestMatch = '';
      for (let i = 1; i <= Math.min(numericValue.length, 4); i++) {
        const partialCode = numericValue.substring(0, i);
        if (COUNTRY_CODES[partialCode]) {
          longestMatch = partialCode;
        }
      }
      
      if (longestMatch) {
        setCountryCode(longestMatch);
      } else {
        setCountryCode(numericValue.substring(0, Math.min(numericValue.length, 4)));
      }
      setIsCountryCodeEditable(true);
    }
    
    handleInputChange('phone', numericValue);
  };

  const handleCountryCodeClick = () => {
    if (!isCountryCodeEditable) {
      setIsCountryCodeEditable(true);
      // Find the current country code length and keep it for editing
      const countryMatch = findCountryCode(formData.phone);
      if (countryMatch) {
        setCountryCode(formData.phone.substring(0, countryMatch.length));
      }
    }
  };

  const isFormValid = () => {
    return formData.name && 
           formData.email && 
           formData.password && 
           formData.confirmPassword && 
           formData.gender && 
           formData.phone && 
           passwordsMatch;
  };

  async function signup(e) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate all fields are filled
    if (!isFormValid()) {
      setError("Please fill in all required fields and ensure passwords match");
      setIsLoading(false);
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(buildApiUrl(API_ENDPOINTS.SIGNUP), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          'email': formData.email,
          'password': formData.password, 
          'name': formData.name,
          'gender': formData.gender,
          'phone': formData.phone
        }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.token);
        setEmailSafely(formData.email);
        localStorage.setItem("name", data.name || formData.name);
        
        // Update Redux state immediately
        dispatch(loginSuccess({
          token: data.token,
          email: formData.email,
          user: {
            name: data.name || formData.name,
            email: formData.email
          }
        }));
        
        window.location.href = '/hostels';
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Signup failed. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin(credentialResponse) {
    setIsGoogleLoading(true);
    setError(null);

    try {
      // Send the credential (JWT) to backend
      const res = await fetch(buildApiUrl(API_ENDPOINTS.GOOGLE_OAUTH), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Google login failed");
      }

      const data = await res.json();

      if (data.token) {
        // Use the auth hook to handle login
        dispatch(loginSuccess({
          token: data.token,
          email: data.email,
          user: {
            name: data.name || data.email.split('@')[0],
            email: data.email
          }
        }));

        setEmailSafely(data.email);
        localStorage.setItem("token", data.token);
        localStorage.setItem("name", data.name || data.email.split('@')[0]);

        // 🔔 Tell NavBar to update immediately
        window.dispatchEvent(new Event("authChange"));

        // Small delay to ensure Redux state is updated
        setTimeout(() => {
          navigate("/hostels");
        }, 100);
      } else {
        setError("Google login failed. Please try again.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGoogleLoading(false);
    }
  }

  useEffect(() => {
    // Initialize Google Sign-In when component mounts
    let retryCount = 0;
    const maxRetries = 50; // 5 seconds max wait
    
    const initGoogleSignIn = () => {
      if (window.google && window.google.accounts && googleButtonRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: '826839521219-9u0v1qimobnrfnt7plch3nlr8phsnsia.apps.googleusercontent.com',
            callback: handleGoogleLogin,
          });

          window.google.accounts.id.renderButton(
            googleButtonRef.current,
            {
              theme: 'outline',
              size: 'large',
              text: 'signin_with',
              locale: 'en',
            }
          );
        } catch (error) {
          console.error('Error initializing Google Sign-In:', error);
        }
      } else if (retryCount < maxRetries) {
        retryCount++;
        // Retry after a short delay if Google script hasn't loaded yet
        setTimeout(initGoogleSignIn, 100);
      } else {
        console.warn('Google Sign-In script failed to load after maximum retries');
      }
    };

    // Start initialization
    initGoogleSignIn();
  }, []);

  return (
    <form
      action="#"
      method="POST"
      className="sign_up"
      onSubmit={signup}
    >
      <h2 className="form-title">Let's Get to Know You</h2>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="sign_up-item">
        <label htmlFor="name">
          <div className="label_container">
            <User size={20} />
          </div>
        </label>
        <input 
          type="text" 
          id="name" 
          placeholder="Name" 
          autoFocus 
          required 
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
        />
      </div>

      <div className="sign_up-item">
        <label htmlFor="email">
          <div className="label_container">
            <Mail size={20} />
          </div>
        </label>
        <input 
          type="email" 
          id="email" 
          placeholder="E-mail" 
          required 
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
        />
      </div>

      <div className="sign_up-item">
        <label htmlFor="phone">
          <div className="label_container">
            <Phone size={20} />
          </div>
        </label>
        <div className="phone-input-container">
          {countryCode && (
            <div 
              className={`country-code-display ${isCountryCodeEditable ? 'editable' : ''}`}
              onClick={handleCountryCodeClick}
              title={isCountryCodeEditable ? "Editing country code" : "Click to change country code"}
            >
              <span className="country-code-number">+{countryCode}</span>
              {!isCountryCodeEditable && (
                <span className="country-code-name">
                  <span className="country-flag">{COUNTRY_CODES[countryCode]?.flag || '🏳️'}</span>
                  {COUNTRY_CODES[countryCode]?.name || 'Unknown Country'}
                </span>
              )}
              {isCountryCodeEditable && COUNTRY_CODES[countryCode] && (
                <span className="country-code-name">
                  <span className="country-flag">{COUNTRY_CODES[countryCode].flag}</span>
                  {COUNTRY_CODES[countryCode].name}
                </span>
              )}
            </div>
          )}
          <input 
            type="text" 
            id="phone" 
            name="phone"
            placeholder={countryCode ? "Enter phone number" : "Phone Number (start with country code)"} 
            required 
            value={formatPhoneNumber(formData.phone)}
            onChange={handlePhoneChange}
            inputMode="numeric"
            pattern="[0-9 ]*"
            className={countryCode && !isCountryCodeEditable ? "phone-number-only" : ""}
          />
        </div>
      </div>

      <div className="sign_up-item">
        <label htmlFor="gender">
          <div className="label_container">
            <Users size={20} />
          </div>
        </label>
        <select 
          id="gender" 
          required 
          value={formData.gender}
          onChange={(e) => handleInputChange('gender', e.target.value)}
          className="gender-select"
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      <div className="sign_up-item">
        <label htmlFor="password">
          <div className="label_container">
            <Lock size={20} />
          </div>
        </label>
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          placeholder="Password"
          required
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
        />
        <div
          className="show_hide"
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </div>
      </div>

      <div className="sign_up-item">
        <label htmlFor="confirm_password">
          <div className="label_container">
            <UserCheck size={20} />
          </div>
        </label>
        <input
          type={showConfirmPassword ? "text" : "password"}
          id="confirm_password"
          placeholder="Confirm Password"
          required
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
        />
        <div
          className="show_hide"
          onClick={() => setShowConfirmPassword((prev) => !prev)}
        >
          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </div>
      </div>

      {!passwordsMatch && formData.confirmPassword && (
        <div className="error-message">
          Passwords do not match
        </div>
      )}

      <button 
        type="submit" 
        className="form_submit" 
        disabled={isLoading || !isFormValid()}
      >
        {isLoading ? "Creating Account..." : "Submit"}
      </button>

      <div className="divider" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        margin: '20px 0',
        textAlign: 'center'
      }}>
        <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }}></div>
        <span style={{ padding: '0 15px', color: '#666', fontSize: '14px' }}>OR</span>
        <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }}></div>
      </div>

      <div 
        ref={googleButtonRef}
        id="google-signin-button"
        style={{ 
          width: '100%', 
          minHeight: '40px',
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '20px'
        }}
      ></div>

      <p className="login_option">
        Already have an account? <Link to="/login">Login Here</Link>
      </p>
    </form>
  );
}

export default SignUpForms;
