# 🗳️ VoteChain - Blockchain-Based Digital Voting System

A comprehensive, secure, and transparent digital voting platform built with blockchain technology, featuring multi-language support, AR voting badges, and end-to-end encryption.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Code Explanation](#code-explanation)
- [Key Components](#key-components)
- [Security Features](#security-features)
- [Future Enhancements](#future-enhancements)

## 🎯 Overview

HackCBS is a modern digital voting system designed to ensure transparency, security, and accessibility in elections. The platform combines blockchain technology for immutable vote recording, biometric verification for identity authentication, and a user-friendly interface supporting multiple Indian languages.

### Key Highlights

- **Blockchain-Based Voting**: Votes are recorded on a blockchain for transparency and immutability
- **Multi-Language Support**: Available in 12+ Indian languages (Hindi, English, Bengali, Gujarati, Tamil, Telugu, etc.)
- **AR Voting Badge**: Digital ink mark on finger using Augmented Reality after voting
- **Biometric Verification**: Aadhaar and face verification for secure registration
- **Real-Time Results**: Live election results with vote tracking
- **Admin Dashboard**: Comprehensive election management system

## ✨ Features

### For Voters

1. **Secure Registration**
   - Personal information collection
   - Aadhaar verification
   - Face verification using MediaPipe
   - Automatic voter ID generation

2. **Voting Experience**
   - View eligible elections based on location
   - Cast votes with end-to-end encryption
   - Real-time vote confirmation
   - AR voting badge with digital ink

3. **Account Management**
   - View voting history
   - Profile management
   - KYC status tracking
   - Vote verification

### For Administrators

1. **Election Management**
   - Create elections (Lok Sabha, State Assembly, Local)
   - Add/remove candidates
   - Set election dates and duration
   - End elections and view results

2. **Analytics**
   - Real-time vote statistics
   - Vote bank (all votes with anonymized voter hashes)
   - Vote verification by voter ID
   - Election results with percentages

## 🏗️ Architecture

The project follows a three-tier architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│  - React Components  - Multi-language Support            │
│  - AR Features      - User Interface                    │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Backend API (Express.js)                    │
│  - RESTful APIs    - MongoDB Database                  │
│  - Authentication  - Business Logic                     │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│            Blockchain (Solidity/Hardhat)               │
│  - Smart Contracts - Vote Recording                    │
│  - Immutability    - Transparency                       │
└─────────────────────────────────────────────────────────┘
```

### Component Breakdown

1. **Frontend** (`/frontend`)
   - Next.js 16 with React 19
   - TypeScript for type safety
   - Tailwind CSS for styling
   - Framer Motion for animations
   - MediaPipe for face/hand detection

2. **Backend** (`/backend`)
   - Express.js REST API
   - MongoDB for data storage
   - JWT-like authentication
   - QR code generation service (Python)

3. **Blockchain** (`/blockchain`)
   - Solidity smart contracts
   - Hardhat development environment
   - Vote recording and verification

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16.1
- **Language**: TypeScript, JavaScript
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **QR Code**: jsQR

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Language**: JavaScript (ES6+)
- **QR Service**: Python Flask

### Blockchain
- **Language**: Solidity ^0.8.20
- **Framework**: Hardhat
- **Network**: Ethereum-compatible

### Additional Tools
- **Package Manager**: npm
- **Version Control**: Git
- **Environment**: dotenv

## 📁 Project Structure

```
HackCBS/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # Next.js app router pages
│   │   ├── admin/           # Admin dashboard pages
│   │   ├── dashboard/       # User dashboard pages
│   │   ├── register/        # Registration flow pages
│   │   ├── login/           # Login page
│   │   └── api.js           # API client functions
│   ├── components/          # React components
│   │   ├── ARFingerInk.tsx  # AR finger ink component
│   │   ├── ElectionCard.tsx # Election display card
│   │   ├── Navbar.tsx       # Navigation bar
│   │   └── ...
│   ├── contexts/            # React contexts
│   │   └── LanguageContext.tsx
│   ├── translations/        # Multi-language files
│   │   ├── en.json
│   │   ├── hi.json
│   │   └── ...
│   └── package.json
│
├── backend/                 # Express.js backend API
│   ├── models/             # MongoDB schemas
│   │   ├── usermodel.js    # User schema
│   │   ├── electionModel.js # Election schema
│   │   ├── voteModel.js    # Vote schema
│   │   └── ...
│   ├── utils/              # Utility functions
│   │   ├── voterIdGenerator.js # Voter ID generation
│   │   └── locationCodes.js    # Location code mappings
│   ├── server.js           # Main Express server
│   ├── db.js              # MongoDB connection
│   ├── qr_service.py      # Python QR code service
│   └── package.json
│
├── blockchain/             # Smart contracts
│   ├── contracts/         # Solidity contracts
│   │   └── Voting.sol     # Main voting contract
│   ├── scripts/           # Deployment scripts
│   └── hardhat.config.js  # Hardhat configuration
│
└── README.md              # This file
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Python 3.8+ (for QR service)
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd HackCBS
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
MONGODB_URI=mongodb://localhost:27017/voting-system
PORT=5000
VOTER_HASH_SALT=your_secret_salt_here
PASSWORD_SALT=your_password_salt_here
EOF

# Start MongoDB (if using local)
# Windows: Start MongoDB service
# Linux/Mac: mongod

# Start backend server
npm start
# or for development
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file (optional)
cat > .env.local << EOF
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
EOF

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:3000`

### 4. Blockchain Setup

```bash
cd blockchain

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests (if available)
npx hardhat test

# Deploy contracts (configure network in hardhat.config.js first)
npx hardhat run scripts/deploy.cjs
```

### 5. QR Service Setup (Optional - for AR Badge)

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start QR service
# Windows:
start_qr_service.bat

# Linux/Mac:
chmod +x start_qr_service.sh
./start_qr_service.sh

# Or manually:
python qr_service.py
```

QR service runs on `http://localhost:5001`

## 📡 API Documentation

### Authentication

#### Login
```http
POST /api/login
Content-Type: application/json

{
  "voterId": "VCAP062325ABCDEF3"
}
```

**Response:**
```json
{
  "message": "Voter ID validated successfully",
  "voterId": "VCAP062325ABCDEF3",
  "valid": true,
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Registration

#### Step 1: Personal Details
```http
POST /api/register/personal
Content-Type: application/json

{
  "name": "John Doe",
  "age": 25,
  "fatherName": "Father Name",
  "motherName": "Mother Name",
  "phone": "1234567890",
  "email": "john@example.com",
  "presentAddress": {...},
  "permanentAddress": {...},
  "district": "Delhi",
  "constituency": "New Delhi"
}
```

#### Step 2: Aadhaar Verification
```http
POST /api/register/aadhaar
Content-Type: application/json

{
  "userId": "user_id_from_step1",
  "aadhaarNumber": "123456789012",
  "addressProofType": "aadhaar"
}
```

#### Step 3: Face Verification
```http
POST /api/register/face
Content-Type: application/json

{
  "userId": "user_id_from_step1",
  "faceImages": ["base64_image1", "base64_image2"]
}
```

### Elections

#### Get Eligible Elections
```http
POST /api/elections/eligible
Content-Type: application/json

{
  "voterId": "VCAP062325ABCDEF3",
  "state": "Delhi"
}
```

#### Get Candidates
```http
GET /api/elections/:electionId/candidates
```

#### Cast Vote
```http
POST /api/vote
Content-Type: application/json

{
  "userId": "user_id",
  "electionId": "election_id",
  "candidateId": "candidate_id",
  "voterId": "VCAP062325ABCDEF3"
}
```

#### Get Results
```http
GET /api/elections/:electionId/results
```

#### Get Vote Bank
```http
GET /api/elections/:electionId/votes
```

### Admin APIs

#### Create Election
```http
POST /api/admin/elections
Content-Type: application/json

{
  "title": "Lok Sabha Election 2024",
  "description": "General Election",
  "electionType": "lok-sabha",
  "state": "National",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

#### Add Candidate
```http
POST /api/admin/elections/:electionId/candidates
Content-Type: application/json

{
  "name": "Candidate Name",
  "party": "Party Name"
}
```

## 💻 Code Explanation

### Voter ID Generation (`backend/utils/voterIdGenerator.js`)

The voter ID follows a specific format: `VC + SS + DD + CC + YY + RAND6 + CHK`

- **VC**: Voter Card prefix
- **SS**: State code (2 characters)
- **DD**: District code (2 digits)
- **CC**: Constituency code (2 digits)
- **YY**: Year (2 digits)
- **RAND6**: Random alphanumeric (6 characters)
- **CHK**: Checksum digit

**Example**: `VCAP062325ABCDEF3`

```javascript
export function generateVoterId(state, district, constituency) {
  const stateCode = stateCodes[state] || "XX";
  const districtCode = districtCodes[state]?.[district] || "00";
  const constituencyCode = constituencyCodes[district]?.[constituency] || "00";
  const year = new Date().getFullYear().toString().slice(-2);
  const randomPart = generateAlphanumericString(6);
  const idWithoutChecksum = `VC${stateCode}${districtCode}${constituencyCode}${year}${randomPart}`;
  const checksum = calculateChecksum(idWithoutChecksum);
  return `${idWithoutChecksum}${checksum}`;
}
```

### Vote Casting Flow (`backend/server.js`)

1. **Validation**: Checks if user exists and election is active
2. **Duplicate Check**: Ensures user hasn't already voted
3. **Hash Generation**: Creates anonymous voter hash using SHA-256
4. **Blockchain Simulation**: Generates transaction hash
5. **Database Storage**: Saves vote to MongoDB
6. **Vote Count Update**: Updates candidate vote count

```javascript
// Create anonymous voter hash
const salt = process.env.VOTER_HASH_SALT || "votechain_secret_salt_2025";
const voterHash = "0x" + crypto.createHash('sha256')
  .update(voterId + salt).digest('hex');

// Generate transaction hash
const transactionHash = "0x" + crypto.createHash('sha256')
  .update(voterId + electionId + candidateId + Date.now().toString())
  .digest('hex').substring(0, 64);
```

### Smart Contract (`blockchain/contracts/Voting.sol`)

The Voting contract provides:

- **Vote Recording**: Records votes with voter hash (anonymous)
- **Duplicate Prevention**: Checks if voter has already voted
- **Candidate Management**: Add candidates and track vote counts
- **Election Control**: Start/end elections
- **Results Retrieval**: Get vote counts and results

```solidity
function vote(uint electionId, uint candidateId, bytes32 voterHash) public {
    require(!electionEnded[electionId], "Election has ended");
    require(!hasVoted[electionId][voterHash], "Already voted!");
    
    // Find and update candidate vote count
    for (uint i = 0; i < candidates[electionId].length; i++) {
        if (candidates[electionId][i].id == candidateId) {
            candidates[electionId][i].voteCount++;
            break;
        }
    }
    
    hasVoted[electionId][voterHash] = true;
    votes[electionId].push(VoteRecord(electionId, candidateId, voterHash, block.timestamp));
    emit VoteCast(electionId, candidateId, voterHash, block.timestamp);
}
```

### AR Voting Badge (`frontend/components/ARFingerInk.tsx`)

The AR component uses MediaPipe Hands to detect the index finger and overlay a digital ink mark:

1. **Camera Access**: Requests front-facing camera
2. **Hand Detection**: Uses MediaPipe Hands model
3. **Finger Tracking**: Tracks index finger tip and joints
4. **AR Overlay**: Renders 3D "V" symbol on finger tip
5. **Visual Effects**: Adds glow and ink-like appearance

```typescript
// Initialize MediaPipe Hands
const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
```

### Multi-Language Support (`frontend/contexts/LanguageContext.tsx`)

The app supports 12+ Indian languages through a context-based translation system:

- **Language Detection**: Detects browser language or user preference
- **Dynamic Translation**: All UI text is translated dynamically
- **Language Switching**: Users can switch language anytime
- **Persistent Preference**: Saves language choice in localStorage

```typescript
const LanguageContext = createContext({
  language: 'en',
  setLanguage: (lang: string) => {},
  t: (key: string) => string
});
```

## 🔑 Key Components

### Frontend Components

1. **ElectionCard** (`components/ElectionCard.tsx`)
   - Displays election information
   - Shows vote status
   - Handles election selection

2. **VoteModal** (`components/VoteModal.tsx`)
   - Candidate selection interface
   - Vote confirmation
   - Blockchain transaction display

3. **VotingBadge** (`components/VotingBadge.tsx`)
   - QR code generation
   - AR badge unlock
   - Social sharing

4. **RegistrationProgress** (`components/RegistrationProgress.tsx`)
   - Multi-step registration flow
   - Progress tracking
   - Step validation

### Backend Models

1. **User Model** (`models/usermodel.js`)
   - User information
   - KYC status
   - Voter ID
   - Vote references

2. **Election Model** (`models/electionModel.js`)
   - Election details
   - Candidates array
   - Vote counts
   - Status tracking

3. **Vote Model** (`models/voteModel.js`)
   - Voter ID (for verification)
   - Election and candidate references
   - Blockchain hash
   - Timestamp

## 🔒 Security Features

### 1. Anonymous Voting
- Voter IDs are hashed before recording on blockchain
- Only voter hash is stored, not actual voter ID
- Votes cannot be traced back to individuals

### 2. End-to-End Encryption
- All vote data is encrypted before transmission
- Blockchain transaction hashes ensure integrity
- SHA-256 hashing for voter anonymity

### 3. Duplicate Prevention
- Database checks prevent double voting
- Blockchain contract enforces one vote per voter hash
- Election status validation

### 4. KYC Verification
- Aadhaar verification (placeholder for real implementation)
- Face verification using MediaPipe
- Multi-step verification process

### 5. Access Control
- Voter ID-based authentication
- Admin authentication (to be implemented)
- Role-based access control

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Mode**: (Can be added)
- **Smooth Animations**: Framer Motion for transitions
- **Loading States**: Skeleton loaders and progress indicators
- **Error Handling**: User-friendly error messages
- **Accessibility**: ARIA labels and keyboard navigation

## 🚧 Future Enhancements

1. **Real Blockchain Integration**
   - Deploy to Ethereum testnet/mainnet
   - Connect frontend to Web3 wallet
   - Real-time blockchain event listening

2. **Enhanced Security**
   - JWT token authentication
   - Rate limiting
   - CAPTCHA for registration
   - Two-factor authentication

3. **Advanced Features**
   - Email/SMS notifications
   - Vote reminders
   - Election calendar
   - Candidate profiles with photos

4. **Analytics Dashboard**
   - Real-time vote visualization
   - Geographic vote distribution
   - Demographic analysis
   - Export reports

5. **Mobile App**
   - React Native application
   - Push notifications
   - Offline voting capability

6. **Accessibility Improvements**
   - Screen reader support
   - Voice commands
   - High contrast mode
   - Font size adjustment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

Developed for HackCBS hackathon.

## 📞 Support

For support, email support@hackcbs.com or create an issue in the repository.

## 🙏 Acknowledgments

- MediaPipe for biometric detection
- Next.js team for the amazing framework
- Hardhat for blockchain development tools
- All open-source contributors

---

**Note**: This is a prototype/demo project. For production use, additional security measures, audits, and compliance checks are required.

