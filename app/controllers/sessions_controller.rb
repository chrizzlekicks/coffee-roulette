# frozen_string_literal: true

class SessionsController < ApplicationController
  def create
    user = User.find_by(username: user_params[:username])

    if user.blank?
      return render json: { message: 'Username or password seem to be wrong or non existent' }, status: :bad_request
    end

    unless user.authenticate(user_params[:password])
      return render json: { message: 'Username or password seem to be wrong or non existent' },
                    status: :bad_request
    end

    log_in user
  rescue StandardError
    head :unprocessable_entity
  end

  def destroy
    return render json: { message: 'User is not logged in' }, status: :unauthorized unless is_logged_in?

    log_out
  rescue StandardError
    head :unprocessable_entity
  end

  private

  def user_params
    params.require(:user).permit(:username, :password)
  end

  def log_in(user)
    session[:user_id] = user.id

    render json: { username: user.username, message: 'Session created' }, status: :created
  end
end
