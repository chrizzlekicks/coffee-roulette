class SessionsController < ApplicationController
  def create
    user = User.find_by(username: params[:username])

    return render json: "User not found", status: :not_found unless user.present?

    return render json: "Invalid password", status: :bad_request unless user.authenticate(params[:password])

    session[:user_id] = user.id
    render json: "Session created", status: :created

  rescue Exception
    head :unprocessable_entity
  end
end
