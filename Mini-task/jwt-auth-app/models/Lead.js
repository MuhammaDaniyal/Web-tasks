import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema({
    // Core required fields (from assignment PDF)
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    propertyInterest: { type: String },
    budget: { type: Number, required: true },
    notes: { type: String },
    
    // Status tracking
    status: { 
        type: String, 
        enum: ['New', 'Contacted', 'In Progress', 'Closed', 'Lost'], 
        default: 'New' 
    },
    
    // Assignment
    assignedTo: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        default: null 
    },
    
    // Auto-calculated fields (from pre-save)
    priority: { 
        type: String, 
        enum: ['High', 'Medium', 'Low'], 
        default: 'Low' 
    },
    score: { 
        type: Number, 
        default: 0 
    },
    
    // Optional (for bonus features)
    followUpDate: { type: Date, default: null },  // For follow-up system
    lastActivityAt: { type: Date, default: Date.now }, // For stale detection
    
}, { timestamps: true });  // Gives you createdAt & updatedAt automatically

// Auto-calculate priority + score before saving
// Use validate instead of save
LeadSchema.pre('validate', function() {
    if (this.budget > 20000000) {
        this.priority = 'High';
        this.score = 100;
    } else if (this.budget >= 10000000) {
        this.priority = 'Medium';
        this.score = 60;
    } else {
        this.priority = 'Low';
        this.score = 20;
    }
});

export default mongoose.models.Lead || mongoose.model('Lead', LeadSchema);