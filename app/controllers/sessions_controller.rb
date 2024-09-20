# frozen_string_literal: true

class SessionsController < ApplicationController
  def create
    user = User.find_by(username: params[:username])

    return render json: 'Email or password seem to be wrong or non existent', status: :bad_request if user.blank?

    unless user.authenticate(params[:password])
      return render json: 'Email or password seem to be wrong or non existent',
                    status: :bad_request
    end

    log_in user
  rescue StandardError
    head :unprocessable_entity
  end

  def destroy
    return render json: 'User is not logged in', status: :unauthorized unless is_logged_in?

    log_out
  rescue StandardError
    head :unprocessable_entity
  end

  private

  def log_in(user)
    session[:user_id] = user.id

    render json: 'Session created', status: :created
  end
end
