# # frozen_string_literal: true

require "test_helper"

class UserMatchingJobTest < ActiveJob::TestCase
  setup do
    @job = UserMatchingJob.new
  end

  test 'does nothing when there are no users' do
    @job.perform_now

    assert_empty UserMatch.all
  end

  test 'does nothing when there is only one user' do
    stub_multiple_users 1

    assert_equal 0, @job.perform_now
    assert_empty UserMatch.all
  end

  test 'creates match when there are at least 2 users' do
    stub_multiple_users 2

    assert_equal 1, @job.perform_now
    assert_equal 2, UserMatch.count
  end

  test 'merges odd number of users' do
    stub_multiple_users 3

    assert_equal 1, @job.perform_now
    assert_equal User.count, UserMatch.count
  end

  test 'creates half the size of matches according to users' do
    stub_multiple_users 10

    assert_equal 5, @job.perform_now
    assert_equal User.count, UserMatch.count
  end

  test 'bring it on' do
    stub_multiple_users 213

    assert_equal 106, @job.perform_now
    assert_equal User.count, UserMatch.count
  end

  test 'only match active users' do
    stub_multiple_users 4

    inactive_user = User.last
    inactive_user.update!(active: false)

    assert_equal 1, @job.perform_now
    assert_not UserMatch.all.pluck(:user_id).include?(inactive_user.id)
  end
end

