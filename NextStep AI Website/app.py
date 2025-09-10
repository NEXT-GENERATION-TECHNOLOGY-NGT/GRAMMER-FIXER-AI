from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import os

app = Flask(__name__)
app.secret_key = "the_secret_key"

USERS_FILE = "users.txt"
SUBJECTS_FILE = "subjects.txt"

def load_users():
    users = {}
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, "r") as f:
            for line in f:
                parts = line.strip().split(",")
                if len(parts) == 6:
                    user_no, name, user_id, matric_year, email, password = parts
                    users[email] = {
                        "user_no": user_no,
                        "name": name,
                        "id": user_id,
                        "matric_year": matric_year,
                        "email": email,
                        "password": password
                    }
    return users

def save_user(name, user_id, matric_year, email, password):
    # assign user number 
    next_no = 1
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, "r") as f:
            lines = f.readlines()
            if lines:
                last_line = lines[-1].strip().split(",")
                if len(last_line) >= 1 and last_line[0].isdigit():
                    next_no = int(last_line[0]) + 1

    with open(USERS_FILE, "a") as f:
        f.write(f"{next_no},{name},{user_id},{matric_year},{email},{password}\n")

@app.route("/save_subjects", methods=["POST"])
def save_subjects():
    if "email" not in session:
        return jsonify({"success": False, "message": "Not logged in"})

    data = request.json
    subjects = data.get("subjects", [])
    user_email = session["email"]

    # append subjects
    with open(SUBJECTS_FILE, "a") as f:
        for subj in subjects:
            f.write(f"{user_email}|{subj['name']}|{subj['marks']}|{subj['aps']}\n")

    return jsonify({"success": True, "message": "Subjects saved"})

@app.route("/get_subjects", methods=["GET"])
def get_subjects():
    if "email" not in session:
        return jsonify({"success": False, "message": "Not logged in"})

    user_email = session["email"]
    results = []

    if os.path.exists(SUBJECTS_FILE):
        with open(SUBJECTS_FILE, "r") as f:
            for line in f:
                parts = line.strip().split("|")
                if parts[0] == user_email:
                    results.append({
                        "name": parts[1],
                        "marks": parts[2],
                        "aps": parts[3]
                    })

    return jsonify({"success": True, "subjects": results})

@app.route("/")
def home():
    return render_template("home.html")

@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    name = data.get("name").strip()
    user_id = data.get("id").strip()
    matric_year = data.get("matricYear").strip()
    email = data.get("email").strip()
    password = data.get("password").strip()

    users = load_users()
    if email in users:
        return jsonify({"success": False, "message": "User already exists!"})

    save_user(name, user_id, matric_year, email, password)

    # return new user
    users = load_users()
    new_user = users[email]

    # auto login new user
    session["email"] = email
    return jsonify({"success": True, "message": "Signup successful!", "user": new_user})

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email").strip()
    password = data.get("password").strip()

    users = load_users()
    user = users.get(email)

    if user and user["password"] == password:
        session.permanent = True
        session['email'] = email
        return jsonify({"success": True, "message": "Login successful!", "user": user})
    return jsonify({"success": False, "message": "Invalid email or password."})

@app.route('/results')
def results():
    return render_template('results.html')


@app.route("/logout")
def logout():
    session.pop("email", None)
    return redirect(url_for("home"))

if __name__ == "__main__":
    app.run(debug=True)
