from sqlalchemy.orm import Session
from ..models import Job, CandidateProfile, Application
from datetime import datetime

class SeedService:
    @staticmethod
    def seed_jobs(db: Session):
        """Seed sample job data"""
        jobs_data = [
            {
                "title": "Senior Python Backend Developer",
                "company_name": "HealthTech Solutions",
                "description": "Build scalable backend systems for healthcare applications using Python and FastAPI.",
                "required_skills": "Python, FastAPI, PostgreSQL, Docker, AWS",
                "experience_level": "Senior",
                "location": "Pune, Remote",
                "domain": "Healthcare",
                "role_type": "Backend Developer",
                "status": "Open"
            },
            {
                "title": "Full Stack React Developer",
                "company_name": "Fintech Innovations",
                "description": "Develop modern web applications for financial services using React and Node.js.",
                "required_skills": "React, Node.js, JavaScript, MongoDB, GraphQL",
                "experience_level": "Mid",
                "location": "Mumbai, Hybrid",
                "domain": "Finance",
                "role_type": "Full Stack Developer",
                "status": "Open"
            },
            {
                "title": "Machine Learning Engineer",
                "company_name": "AI Startup Labs",
                "description": "Build ML models and data pipelines for predictive analytics.",
                "required_skills": "Python, TensorFlow, Scikit-learn, SQL, Docker",
                "experience_level": "Mid",
                "location": "Bangalore, Remote",
                "domain": "AI/ML",
                "role_type": "ML Engineer",
                "status": "Open"
            },
            {
                "title": "DevOps Engineer",
                "company_name": "Cloud Systems Corp",
                "description": "Manage cloud infrastructure and CI/CD pipelines for enterprise applications.",
                "required_skills": "AWS, Kubernetes, Terraform, Jenkins, Docker",
                "experience_level": "Senior",
                "location": "Delhi, On-site",
                "domain": "Cloud Infrastructure",
                "role_type": "DevOps Engineer",
                "status": "Open"
            },
            {
                "title": "Site Reliability Engineer",
                "company_name": "TechOps Pro",
                "description": "Build and maintain CI/CD pipelines, automate deployments, and ensure system reliability.",
                "required_skills": "Jenkins, Docker, Kubernetes, CI/CD, Python, AWS",
                "experience_level": "Mid",
                "location": "Pune, Hybrid",
                "domain": "Infrastructure",
                "role_type": "DevOps Engineer", 
                "status": "Open"
            },
            {
                "title": "Frontend React Developer",
                "company_name": "E-commerce Giant",
                "description": "Create responsive user interfaces for e-commerce platform.",
                "required_skills": "React, TypeScript, CSS, Jest, Webpack",
                "experience_level": "Mid",
                "location": "Chennai, Remote",
                "domain": "E-commerce",
                "role_type": "Frontend Developer",
                "status": "Open"
            },
            {
                "title": "Data Scientist",
                "company_name": "Analytics Pro",
                "description": "Analyze large datasets and build predictive models for business insights.",
                "required_skills": "Python, R, SQL, Tableau, Statistics",
                "experience_level": "Senior",
                "location": "Hyderabad, Hybrid",
                "domain": "Data Analytics",
                "role_type": "Data Scientist",
                "status": "Open"
            },
            {
                "title": "Junior Java Developer",
                "company_name": "Enterprise Solutions",
                "description": "Develop enterprise applications using Java and Spring framework.",
                "required_skills": "Java, Spring Boot, MySQL, Maven, Git",
                "experience_level": "Entry",
                "location": "Pune, On-site",
                "domain": "Enterprise Software",
                "role_type": "Backend Developer",
                "status": "Open"
            },
            {
                "title": "Product Manager - Tech",
                "company_name": "Startup Hub",
                "description": "Lead product development for B2B SaaS platform.",
                "required_skills": "Product Management, Agile, SQL, Analytics, Leadership",
                "experience_level": "Senior",
                "location": "Gurgaon, Hybrid",
                "domain": "SaaS",
                "role_type": "Product Manager",
                "status": "Closed"
            }
        ]
        
        for job_data in jobs_data:
            existing_job = db.query(Job).filter(Job.title == job_data["title"]).first()
            if not existing_job:
                job = Job(**job_data)
                db.add(job)
        
        db.commit()
    
    @staticmethod
    def seed_candidates(db: Session):
        """Seed sample candidate data and create corresponding user records"""
        from ..services.auth_service import AuthService
        from ..models.user import User

        candidates_data = [
            {
                "name": "Rahul Sharma",
                "email": "rahul.sharma@email.com",
                "skills": "Python, FastAPI, PostgreSQL, Docker, AWS",
                "education": "B.Tech Computer Science, IIT Delhi",
                "project_summaries": "Built microservices architecture for e-commerce platform. Developed RESTful APIs handling 1M+ requests/day.",
                "preferred_location": "Pune, Remote",
                "preferred_role_type": "Backend Developer",
                "domain_interest": "Healthcare, Fintech",
                "experience_level": "Mid"
            },
            {
                "name": "Priya Patel",
                "email": "priya.patel@email.com", 
                "skills": "React, JavaScript, Node.js, MongoDB, GraphQL",
                "education": "MCA, Pune University",
                "project_summaries": "Developed responsive web applications for 3 startups. Expert in modern React patterns and state management.",
                "preferred_location": "Mumbai, Pune",
                "preferred_role_type": "Full Stack Developer",
                "domain_interest": "E-commerce, SaaS",
                "experience_level": "Mid"
            },
            {
                "name": "Amit Kumar",
                "email": "amit.kumar@email.com",
                "skills": "Python, TensorFlow, Scikit-learn, SQL, Statistics",
                "education": "M.Tech Data Science, IIIT Bangalore",
                "project_summaries": "Built ML models for predictive analytics. Experience with computer vision and NLP projects.",
                "preferred_location": "Bangalore, Remote",
                "preferred_role_type": "ML Engineer",
                "domain_interest": "AI/ML, Healthcare",
                "experience_level": "Senior"
            }
        ]
        
        for candidate_data in candidates_data:
            user = db.query(User).filter(User.email == candidate_data["email"]).first()
            if not user:
                print(f"[SEED] Creating user for candidate: {candidate_data['email']}")
                user = AuthService.create_user(
                    db=db,
                    email=candidate_data["email"],
                    password="Candidate@123!",
                    name=candidate_data["name"],
                    role="candidate"
                )
                user.is_verified = True
                user.is_active = True
                db.commit()
            
            existing_candidate = db.query(CandidateProfile).filter(
                CandidateProfile.email == candidate_data["email"]
            ).first()
            if not existing_candidate:
                candidate = CandidateProfile(**candidate_data)
                candidate.id = user.id
                db.add(candidate)
        
        db.commit()
    
    @staticmethod
    def seed_applications(db: Session):
        """Seed sample applications"""
        from ..models.candidate import CandidateProfile
        
        rahul = db.query(CandidateProfile).filter(CandidateProfile.email == "rahul.sharma@email.com").first()
        priya = db.query(CandidateProfile).filter(CandidateProfile.email == "priya.patel@email.com").first()
        amit = db.query(CandidateProfile).filter(CandidateProfile.email == "amit.kumar@email.com").first()
        
        if not rahul or not priya or not amit:
            print("[SEED] Candidates not found for application seeding, skipping...")
            return

        applications_data = [
            {"candidate_id": rahul.id, "job_id": 1, "status": "Applied"},
            {"candidate_id": rahul.id, "job_id": 3, "status": "Shortlisted"},
            {"candidate_id": priya.id, "job_id": 2, "status": "Applied"},
            {"candidate_id": priya.id, "job_id": 5, "status": "Applied"},
            {"candidate_id": amit.id, "job_id": 3, "status": "Shortlisted"},
            {"candidate_id": amit.id, "job_id": 6, "status": "Rejected"}
        ]
        
        for app_data in applications_data:
            existing_app = db.query(Application).filter(
                Application.candidate_id == app_data["candidate_id"],
                Application.job_id == app_data["job_id"]
            ).first()
            if not existing_app:
                application = Application(**app_data)
                db.add(application)
        
        db.commit()
    
    @staticmethod
    def seed_all_data(db: Session):
        """Seed all demo data including admin user"""
        # Import here to avoid circular imports
        from ..services.auth_service import AuthService
        from ..models.user import User
        
        # Create admin user first
        admin_email = "admin@aijobboard.com"
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        
        if not existing_admin:
            print("[SEED] Creating admin user...")
            admin_user = AuthService.create_user(
                db=db,
                email=admin_email,
                password="Admin@123!",
                name="System Administrator",
                role="admin"
            )
            # Mark admin as verified and active
            admin_user.is_verified = True
            admin_user.is_active = True
            db.commit()
            print(f"[SEED] Admin user created: {admin_email}")
        else:
            print("[SEED] Admin user already exists")
        
        # Seed other data
        SeedService.seed_jobs(db)
        SeedService.seed_candidates(db)
        SeedService.seed_applications(db)