# frozen_string_literal: true

require 'test_helper'

class MatchesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = User.create!(username: 'test', email: 'test@test.de', password: 'randompasswd')
    create_session_for(@user)
  end

  test 'returns an empty array when there are no matches' do
    get matches_path, as: :json

    assert_response :ok
    assert_empty JSON.parse(response.body)
  end

  test 'returns all matches for a user' do
    stub_multiple_users 3

    UserMatchingJob.new.perform_now

    get matches_path, as: :json

    assert_response :ok
    assert_equal 1, JSON.parse(response.body).length
    assert_not_equal JSON.parse(response.body).first['users'].pluck('email'), @user.email
  end

  test 'returns all matches for current user with multiple matches' do
    stub_multiple_users 8
    4.times { UserMatchingJob.new.perform_now }

    get matches_path, as: :json

    parsed_body = JSON.parse(response.body)
    assert_response :ok
    assert_equal 4, parsed_body.length
    assert_equal Match.joins(:user_matches).where(user_matches: { user_id: @user.id }).pluck(:id).sort, parsed_body.pluck('id').sort
  end
end
