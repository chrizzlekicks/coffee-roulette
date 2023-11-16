class UsersController < ApplicationController
  def index
    @users = User.all
    render json: @users
  end

  def show
    @user = User.find(params[:id])

    if @user
      render json: @user, status: :ok
    else
      render json: 'Error', status: :not_found
    end
  end

  def create
    @user = User.create!(user_params)

    render json: @user, status: :created

  rescue ActiveRecord::RecordInvalid => e
    render json: e.message, status: :bad_request
  rescue Exception
    head :unprocessable_entity
  end

  def destroy
    user = User.find(params[:id])
    user.destroy!
    head :no_content

  rescue ActiveRecord::RecordNotFound => e
    render json: e.message, status: :not_found
  rescue Exception
    head :unprocessable_entity
  end

  private

  def user_params
    params.require(:user).permit(:email, :name)
  end
end
