class UsersController < ApplicationController
  def create
    @user = User.create!(params)
  end
end
