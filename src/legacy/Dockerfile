# Step 1: Use an official Python image as the base and install ffmpeg
FROM python:3.12-slim

RUN apt-get -y update && apt-get -y upgrade && apt-get install -y ffmpeg

# Step 2: Set the working directory in the container
WORKDIR /app

# Step 3: Copy the current directory contents into the container at /app
COPY . .

# Step 4: Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Step 5: Expose port 5000 for Flask
EXPOSE 5000

# Step 6: Define environment variables (optional)
ENV FLASK_APP=app.py
ENV FLASK_ENV=development

# Step 7: Command to run both Flask app and background task
CMD ["sh", "-c", "flask run --host=0.0.0.0 & python transcribe.py"]