class SessionsController < ApplicationController
  def create
    user = User.find_by(username: params[:username])

    return render json: "User not found", status: :not_found unless user.present?

    return render json: "Invalid password", status: :bad_request unless user.authenticate(params[:password])

    log_in user
  rescue Exception
    head :unprocessable_entity
  end

  def destroy
    return render json: "User is not logged in", status: :unauthorized unless is_logged_in?

    log_out

  rescue Exception
    head :unprocessable_entity
  end

  private

  def log_in(user)
    session[:user_id] = user.id

    render json: "Session created", status: :created
  end

  def is_logged_in?
    !session[:user_id].nil?
  end

  def log_out
    session.delete(:user_id)

    render json: "Session closed", status: :ok
  end
end
